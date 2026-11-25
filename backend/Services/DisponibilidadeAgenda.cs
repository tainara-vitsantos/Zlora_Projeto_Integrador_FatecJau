using System.Globalization;
using MongoDB.Driver;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Services;

public sealed record DiaDisponivel(string Data, IReadOnlyList<string> Horarios);

public static class DisponibilidadeAgenda
{
    private static readonly string[] DiasSemana =
    {
        "domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"
    };

    public static async Task<IReadOnlyList<DiaDisponivel>> BuscarAsync(
        ContextMongoDb context,
        Profissional profissional,
        int duracaoMinutos,
        DateOnly inicio,
        int quantidadeDias,
        int fusoMinutos)
    {
        var resultado = new List<DiaDisponivel>();
        var agoraUtc = DateTime.UtcNow;
        var inicioPeriodoUtc = ParaUtc(inicio, 0, fusoMinutos);
        var fimPeriodoUtc = ParaUtc(inicio.AddDays(quantidadeDias), 0, fusoMinutos);
        var filtroReservas = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, profissional.EmpresaId) &
            Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, profissional.Id) &
            Builders<Agendamento>.Filter.Ne(a => a.Status, "cancelado") &
            Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, fimPeriodoUtc) &
            Builders<Agendamento>.Filter.Gt(a => a.DataHoraFim, inicioPeriodoUtc);
        var reservas = await context.Agendamentos.Find(filtroReservas)
            .Project(a => new { a.DataHoraInicio, a.DataHoraFim })
            .ToListAsync();

        for (var deslocamento = 0; deslocamento < quantidadeDias; deslocamento++)
        {
            var data = inicio.AddDays(deslocamento);
            var chaveDia = DiasSemana[(int)data.DayOfWeek];
            var jornada = profissional.JornadaTrabalho.FirstOrDefault(
                item => item.Key.Equals(chaveDia, StringComparison.OrdinalIgnoreCase)).Value;
            var livres = new SortedSet<string>(StringComparer.Ordinal);

            if (jornada?.Ativo == true && jornada.Turnos != null)
            {
                var inicioDiaUtc = ParaUtc(data, 0, fusoMinutos);
                var fimDiaUtc = ParaUtc(data.AddDays(1), 0, fusoMinutos);
                var reservasDoDia = reservas.Where(reserva =>
                    reserva.DataHoraInicio < fimDiaUtc && reserva.DataHoraFim > inicioDiaUtc);

                var turnos = jornada.Turnos.Count > 0
                    ? jornada.Turnos
                    : !string.IsNullOrWhiteSpace(jornada.Inicio) && !string.IsNullOrWhiteSpace(jornada.Fim)
                        ? new List<Turno> { new() { Inicio = jornada.Inicio, Fim = jornada.Fim } }
                        : new List<Turno>();
                foreach (var turno in turnos)
                {
                    if (!TentarMinutos(turno.Inicio, out var inicioTurno) ||
                        !TentarMinutos(turno.Fim, out var fimTurno) ||
                        fimTurno <= inicioTurno)
                        continue;

                    for (var minuto = inicioTurno; minuto + duracaoMinutos <= fimTurno; minuto += duracaoMinutos)
                    {
                        var inicioSlot = ParaUtc(data, minuto, fusoMinutos);
                        var fimSlot = inicioSlot.AddMinutes(duracaoMinutos);
                        if (inicioSlot <= agoraUtc ||
                            reservasDoDia.Any(reserva => reserva.DataHoraInicio < fimSlot && reserva.DataHoraFim > inicioSlot) ||
                            profissional.BloqueiosAgenda.Any(bloqueio =>
                                Bloqueia(bloqueio, data, minuto, minuto + duracaoMinutos)))
                            continue;

                        livres.Add(TimeSpan.FromMinutes(minuto).ToString(@"hh\:mm", CultureInfo.InvariantCulture));
                    }
                }
            }

            resultado.Add(new DiaDisponivel(data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), livres.ToArray()));
        }

        return resultado;
    }

    public static bool HorarioPermitido(
        Profissional profissional,
        DateTime inicioUtc,
        DateTime fimUtc,
        int fusoMinutos)
    {
        var inicioLocal = new DateTimeOffset(DateTime.SpecifyKind(inicioUtc, DateTimeKind.Utc))
            .ToOffset(TimeSpan.FromMinutes(-fusoMinutos)).DateTime;
        var fimLocal = new DateTimeOffset(DateTime.SpecifyKind(fimUtc, DateTimeKind.Utc))
            .ToOffset(TimeSpan.FromMinutes(-fusoMinutos)).DateTime;
        var data = DateOnly.FromDateTime(inicioLocal);
        var inicioMinuto = (int)inicioLocal.TimeOfDay.TotalMinutes;
        var fimMinuto = (int)fimLocal.TimeOfDay.TotalMinutes;
        var chaveDia = DiasSemana[(int)data.DayOfWeek];
        var jornada = profissional.JornadaTrabalho.FirstOrDefault(
            item => item.Key.Equals(chaveDia, StringComparison.OrdinalIgnoreCase)).Value;

        if (fimLocal.Date != inicioLocal.Date || jornada?.Ativo != true || jornada.Turnos == null)
            return false;

        var turnos = jornada.Turnos.Count > 0
            ? jornada.Turnos
            : !string.IsNullOrWhiteSpace(jornada.Inicio) && !string.IsNullOrWhiteSpace(jornada.Fim)
                ? new List<Turno> { new() { Inicio = jornada.Inicio, Fim = jornada.Fim } }
                : new List<Turno>();
        var dentroDoTurno = turnos.Any(turno =>
            TentarMinutos(turno.Inicio, out var inicioTurno) &&
            TentarMinutos(turno.Fim, out var fimTurno) &&
            inicioMinuto >= inicioTurno && fimMinuto <= fimTurno && fimTurno > inicioTurno);

        return dentroDoTurno && !profissional.BloqueiosAgenda.Any(bloqueio =>
            Bloqueia(bloqueio, data, inicioMinuto, fimMinuto));
    }

    private static DateTime ParaUtc(DateOnly data, int minutos, int fusoMinutos)
    {
        var local = data.ToDateTime(TimeOnly.MinValue).AddMinutes(minutos);
        return DateTime.SpecifyKind(local.AddMinutes(fusoMinutos), DateTimeKind.Utc);
    }

    private static bool TentarMinutos(string? valor, out int minutos)
    {
        minutos = 0;
        if (!TimeSpan.TryParseExact(valor, @"hh\:mm", CultureInfo.InvariantCulture, out var hora))
            return false;

        minutos = (int)hora.TotalMinutes;
        return minutos >= 0 && minutos < 24 * 60;
    }

    private static bool Bloqueia(BloqueioAgenda bloqueio, DateOnly data, int inicio, int fim)
    {
        if (!DateOnly.TryParseExact(bloqueio.Data, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var dataBloqueada) || dataBloqueada != data)
            return false;

        if (string.IsNullOrWhiteSpace(bloqueio.Inicio) && string.IsNullOrWhiteSpace(bloqueio.Fim))
            return true;

        return TentarMinutos(bloqueio.Inicio, out var inicioBloqueio) &&
            TentarMinutos(bloqueio.Fim, out var fimBloqueio) &&
            inicio < fimBloqueio && fim > inicioBloqueio;
    }
}
