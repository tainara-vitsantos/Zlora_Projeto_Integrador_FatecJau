/* ============================================================
   ZLORA — Comportamentos da página pública
   Dependências: jQuery 3.2.1, Bootstrap Bundle, jQuery Mask
   ============================================================ */

(function ($) {
    'use strict';

    /* ========== ANO NO COPYRIGHT ========== */
    function atualizarAno() {
        var anoEl = document.getElementById('year');
        if (anoEl) anoEl.textContent = new Date().getFullYear();
    }

    /* ========== NAVBAR COM SCROLL ========== */
    function inicializarNavbarScroll() {
        var $nav = $('#nav-menu');
        if (!$nav.length) return;

        var ultimoEstado = false;
        function checar() {
            var scrolled = window.scrollY > 50;
            if (scrolled !== ultimoEstado) {
                $nav.toggleClass('is-scrolling', scrolled);
                ultimoEstado = scrolled;
            }
        }
        checar();
        window.addEventListener('scroll', checar, { passive: true });
    }

    /* ========== NAVEGAÇÃO INTERNA COM OFFSET DA NAVBAR ========== */
    function inicializarNavegacao() {
        $(document).on('click', 'a[href^="#"]', function (e) {
            var href = $(this).attr('href');
            if (!href || href === '#' || href.length < 2) return;

            var $target = $(href);
            if (!$target.length) return;

            e.preventDefault();
            var offset = $target.offset().top - 70;
            $('html, body').animate({ scrollTop: offset }, 500);

            // Fecha menu mobile, se aberto
            var $collapse = $('#menuPrincipal');
            if ($collapse.hasClass('show')) $collapse.collapse('hide');
        });
    }

    /* ========== ALTERNÂNCIA DE PLANOS ========== */
    function inicializarPlanos() {
        var $botoes = $('.price-switch .btn-price');
        var $grupos = $('.price-group');

        $botoes.on('click', function () {
            var id = this.id; // btn-anual | btn-semestral | btn-mensal
            var alvo = id.replace('btn-', ''); // anual | semestral | mensal

            $botoes.removeClass('active').attr('aria-pressed', 'false');
            $(this).addClass('active').attr('aria-pressed', 'true');

            $grupos.each(function () {
                var grupo = this.id.replace('group-', '');
                $(this).prop('hidden', grupo !== alvo);
            });
        });

        // Botões de contratação
        $('.js-plan').on('click', function () {
            var periodo = $(this).data('period');
            var faixa = $(this).data('range');

            // TODO: VALIDAR — direcionar para o fluxo real de contratação
            // Ex: window.location.href = '/checkout?periodo=' + periodo + '&faixa=' + faixa;
            console.info('[Zlora] Plano selecionado:', { periodo: periodo, faixa: faixa });

            // Enquanto não houver checkout, levamos o usuário ao cadastro
            var $cadastro = $('#cadastro');
            if ($cadastro.length) {
                $('html, body').animate({ scrollTop: $cadastro.offset().top - 70 }, 500);
            }
        });
    }

    /* ========== ALTERNÂNCIA DE TIPO DE CADASTRO ========== */
    function inicializarTipoCadastro() {
        var $btnNegocio = $('#btn-negocio');
        var $btnCliente = $('#btn-cliente');
        var $form = $('#form-cadastro');
        var $status = $('#form-status');

        function ativar(botaoAtivo, botaoInativo, tipo) {
            botaoAtivo.addClass('active').attr('aria-pressed', 'true');
            botaoInativo.removeClass('active').attr('aria-pressed', 'false');

            if (tipo === 'negocio') {
                $form.prop('hidden', false);
            } else {
                // TODO: VALIDAR — quando existir cadastro de cliente, exibir formulário ou redirecionar
                $form.prop('hidden', true);
                $status
                    .prop('hidden', false)
                    .text('O cadastro de cliente será disponibilizado em breve.');
            }
        }

        $btnNegocio.on('click', function () {
            $status.prop('hidden', true).text('');
            ativar($btnNegocio, $btnCliente, 'negocio');
        });

        $btnCliente.on('click', function () {
            ativar($btnCliente, $btnNegocio, 'cliente');
        });
    }

    /* ========== MÁSCARA DE TELEFONE ========== */
    function inicializarMascara() {
        if (typeof $.fn.mask === 'function') {
            $('#telefone').mask('(00) 00000-0000');
        }
    }

    /* ========== VALIDAÇÃO DO FORMULÁRIO ========== */
    function inicializarValidacaoFormulario() {
        var $form = $('#form-cadastro');
        if (!$form.length) return;

        var $status = $('#form-status');
        var $btn = $('#btn-cadastrar');

        function mostrarErro(campo, mensagem) {
            var $erro = $('[data-error-for="' + campo + '"]');
            var $input = $('#' + campo);

            if ($erro.length) {
                $erro.text(mensagem).addClass('is-visible');
            }
            if ($input.length) {
                $input.addClass('is-invalid').attr('aria-invalid', 'true');
            }
        }

        function limparErro(campo) {
            var $erro = $('[data-error-for="' + campo + '"]');
            var $input = $('#' + campo);

            if ($erro.length) $erro.text('').removeClass('is-visible');
            if ($input.length) $input.removeClass('is-invalid').removeAttr('aria-invalid');
        }

        function validarEmail(valor) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
        }

        function validarTelefone(valor) {
            var digitos = valor.replace(/\D/g, '');
            return digitos.length >= 10 && digitos.length <= 11;
        }

        $form.on('submit', function (e) {
            e.preventDefault();

            var valido = true;
            var primeiroInvalido = null;

            // Limpa erros anteriores
            ['nome', 'nomecontato', 'telefone', 'email', 'senha', 'conduso'].forEach(limparErro);

            var nome = $('#nome').val().trim();
            var nomecontato = $('#nomecontato').val().trim();
            var telefone = $('#telefone').val().trim();
            var email = $('#email').val().trim();
            var senha = $('#senha').val();
            var conduso = $('#conduso').is(':checked');

            if (nome.length < 2) {
                mostrarErro('nome', 'Informe o nome do estabelecimento.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#nome';
            }
            if (nomecontato.length < 2) {
                mostrarErro('nomecontato', 'Informe o nome do contato.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#nomecontato';
            }
            if (!validarTelefone(telefone)) {
                mostrarErro('telefone', 'Informe um telefone válido com DDD.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#telefone';
            }
            if (!validarEmail(email)) {
                mostrarErro('email', 'Informe um e-mail válido.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#email';
            }
            if (senha.length < 6 || senha.length > 15) {
                mostrarErro('senha', 'A senha deve ter entre 6 e 15 caracteres.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#senha';
            }
            if (!conduso) {
                mostrarErro('conduso', 'É necessário aceitar os Termos de Uso.');
                valido = false;
                primeiroInvalido = primeiroInvalido || '#conduso';
            }

            if (!valido) {
                $status
                    .prop('hidden', false)
                    .text('Verifique os campos destacados antes de continuar.');
                if (primeiroInvalido) $(primeiroInvalido).focus();
                return;
            }

            // TODO: VALIDAR — integrar com o endpoint real de cadastro.
            // Exemplo de envio quando a API estiver pronta:
            //
            // $btn.prop('disabled', true).text('Enviando...');
            // $.ajax({
            //     url: '/api/cadastro',
            //     method: 'POST',
            //     contentType: 'application/json',
            //     data: JSON.stringify({ nome, nomecontato, telefone, email, senha, conduso })
            // })
            // .done(function () {
            //     $status.prop('hidden', false).text('Cadastro realizado com sucesso.');
            //     $form[0].reset();
            // })
            // .fail(function () {
            //     $status.prop('hidden', false).text('Não foi possível concluir o cadastro. Tente novamente.');
            // })
            // .always(function () {
            //     $btn.prop('disabled', false).text('Cadastrar');
            // });

            // Por enquanto, apenas informamos que o envio ainda não está disponível.
            $status
                .prop('hidden', false)
                .text('Envio desativado: integração com o servidor ainda não configurada.');
        });

        // Limpa erro ao digitar
        $form.on('input change', 'input', function () {
            var id = this.id;
            if (id) limparErro(id);
        });
    }

    /* ========== INICIALIZAÇÃO ========== */
    $(function () {
        atualizarAno();
        inicializarNavbarScroll();
        inicializarNavegacao();
        inicializarPlanos();
        inicializarTipoCadastro();
        inicializarMascara();
        inicializarValidacaoFormulario();
    });

})(jQuery);