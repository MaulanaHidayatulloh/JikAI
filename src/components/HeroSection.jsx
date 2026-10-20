export default function HeroSection({ onExplore }) {
  return (
    <section className="hero" id="beranda">
      <div className="hero-copy">
        <h1>
          Satu pertanyaan.
          <br />
          <span>Seribu kemungkinan.</span>
        </h1>

        <p className="hero-description">
          Bagaimana jika sejarah berubah? Bagaimana jika masa depan berjalan
          berbeda? Jelajahi berbagai dunia alternatif dan temukan konsekuensi
          dari setiap kemungkinan bersama JikAI.
        </p>

        <div className="hero-actions">
          <a href="#home-intro" className="button-primary">
            Mulai Sekarang <span aria-hidden="true">→</span>
          </a>

          <a className="button-secondary" href="#contoh">
            Lihat Contoh
          </a>
        </div>

        <div className="hero-note">
          <span aria-hidden="true">✳</span>
          Dunia hipotetis, ide tanpa batas.
        </div>
      </div>

      <div className="hero-art" aria-label="Ilustrasi jalur dunia alternatif">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />

        <div className="world-center">
          <span className="world-symbol">JikAI</span>
          <span className="world-label">DUNIA KEMUNGKINAN</span>
        </div>

        <div className="world-node node-one">
          <span className="node-dot purple-dot" />
          <span>Sejarah</span>
        </div>

        <div className="world-node node-two">
          <span className="node-dot blue-dot" />
          <span>Masa depan</span>
        </div>

        <div className="world-node node-three">
          <span className="node-dot green-dot" />
          <span>Dunia baru</span>
        </div>

        <div className="art-caption">
          <span>Jelajahi jalur yang berbeda</span>
        </div>
      </div>
    </section>
  );
}
