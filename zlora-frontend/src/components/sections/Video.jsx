export default function Video() {
  return (
    <section className="section pt-0" id="case-video">
      <div className="container">
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/5Sn1lMUvg4U?rel=0"
            title="Vídeo institucional Zlora"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}