'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Mesafeli Satış Sözleşmesi">
      <h2>1. Taraflar</h2>
      <p>
        İşbu Mesafeli Satış Sözleşmesi (&ldquo;Sözleşme&rdquo;), aşağıdaki taraflar
        arasında akdedilmiştir:
      </p>
      <ul>
        <li>
          <strong>SATICI:</strong> Pushify (pushify.dev)
        </li>
        <li>
          <strong>ALICI:</strong> İşbu siteye üye olarak hizmet satın alan gerçek
          veya tüzel kişi.
        </li>
      </ul>

      <h2>2. Sözleşmenin Konusu</h2>
      <p>
        Alıcının siteye giriş yaparak elektronik ortamda satın aldığı, aşağıda
        nitelikleri belirtilen dijital hizmetlerin (&ldquo;Hizmet&rdquo;) satışı
        ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında
        Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tarafların hak ve
        yükümlülüklerini düzenler.
      </p>

      <h2>3. Hizmet Bilgileri</h2>
      <p>
        Pushify, kullanıcılarına bulut tabanlı yayınlama (deployment) ve sunucu
        yönetim hizmetleri sunar. Hizmet planları:
      </p>
      <ul>
        <li>
          <strong>Free:</strong> Ücretsiz, sınırlı özellikler
        </li>
        <li>
          <strong>Hobby:</strong> Aylık 10 USD &mdash; bireysel projeler
        </li>
        <li>
          <strong>Pro:</strong> Aylık 30 USD &mdash; profesyonel ekipler
        </li>
        <li>
          <strong>Business:</strong> Aylık 100 USD &mdash; kurumsal kullanım
        </li>
      </ul>
      <p>
        Tüm fiyatlara KDV dahildir. Güncel fiyatlar{' '}
        <a href="/pricing">/pricing</a> sayfasında yayınlanır.
      </p>

      <h2>4. Genel Hükümler</h2>
      <p>
        Alıcı, satışa konu Hizmetin nitelikleri, satış fiyatı ve ödeme şekli ile
        ifaya ilişkin tüm ön bilgileri okuyup, anladığını ve elektronik ortamda
        gerekli teyidi verdiğini beyan eder.
      </p>

      <h2>5. Ödeme</h2>
      <p>
        Ödemeler <strong>iyzico</strong> altyapısı kullanılarak Visa, Mastercard,
        American Express ve Troy kart sistemleri üzerinden alınır. Tüm ödemeler
        SSL ile şifrelenir ve PCI-DSS uyumlu şekilde işlenir. Kart bilgileri
        Pushify sunucularında saklanmaz.
      </p>

      <h2>6. Hizmetin İfası</h2>
      <p>
        Ödeme onaylandıktan hemen sonra hizmet aktif edilir. Hizmet dijital olduğu
        için fiziksel teslimat yoktur. Aboneliğiniz seçtiğiniz plana göre aylık
        veya yıllık olarak otomatik yenilenir.
      </p>

      <h2>7. Cayma Hakkı</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, dijital
        içerik niteliğindeki hizmetlerde tüketicinin onayı ile ifaya başlandığı
        andan itibaren <strong>cayma hakkı sona ermektedir</strong>. Bununla
        birlikte, Pushify olarak ilk satın almayı izleyen <strong>14 gün içinde</strong>
        memnun kalmadığınız takdirde tam iade sağlıyoruz. Detaylar için{' '}
        <a href="/refund">İade Politikası</a> sayfasına bakınız.
      </p>

      <h2>8. Tarafların Yükümlülükleri</h2>
      <h3>8.1. Satıcının Yükümlülükleri</h3>
      <ul>
        <li>Hizmeti sözleşmede belirtildiği şekilde sağlamak</li>
        <li>%99.9 SLA hedefini sağlamaya çalışmak</li>
        <li>Müşteri verilerini gizli tutmak ve yedeklemek</li>
        <li>Müşteri destek hizmeti sunmak</li>
      </ul>

      <h3>8.2. Alıcının Yükümlülükleri</h3>
      <ul>
        <li>Hesabını ve şifresini güvenli tutmak</li>
        <li>Hizmeti yasal amaçlarla kullanmak</li>
        <li>Üçüncü taraf haklarına saygı göstermek</li>
        <li>Aboneliğini zamanında ödemek</li>
      </ul>

      <h2>9. Yasak Kullanım</h2>
      <p>Pushify aşağıdaki amaçlarla kullanılamaz:</p>
      <ul>
        <li>Yasadışı içerik barındırma veya yayma</li>
        <li>Spam, kötü amaçlı yazılım dağıtımı</li>
        <li>Telif hakkı ihlali içeren materyallerin paylaşımı</li>
        <li>DDoS saldırıları, zararlı yazılım veya kripto madenciliği</li>
        <li>Üçüncü taraf sistemlerine izinsiz erişim girişimleri</li>
      </ul>
      <p>
        Bu kuralların ihlali halinde Pushify, hesabınızı önceden bildirimde
        bulunmaksızın askıya alma veya kapatma hakkını saklı tutar.
      </p>

      <h2>10. Sorumluluk Sınırlaması</h2>
      <p>
        Pushify, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Servis
        sağlayıcı kaynaklı kesintiler, doğal afet, savaş, terör veya benzeri mücbir
        sebep durumlarında sorumluluk kabul edilmez. Pushify&apos;ın toplam sorumluluğu,
        son 12 ayda alınan ücretlerin toplamı ile sınırlıdır.
      </p>

      <h2>11. Aboneliğin Sona Ermesi</h2>
      <ul>
        <li>İstediğiniz zaman aboneliğinizi iptal edebilirsiniz</li>
        <li>İptal sonrası mevcut dönem sonuna kadar hizmet kullanılabilir</li>
        <li>Hesap silindiğinde tüm verileriniz gizlilik politikamıza uygun olarak silinir</li>
      </ul>

      <h2>12. Uyuşmazlıkların Çözümü</h2>
      <p>
        İşbu sözleşmeden doğan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti yasaları
        uygulanır. Tüketici hakem heyetleri ve tüketici mahkemeleri yetkili olup,
        her yıl Sanayi ve Ticaret Bakanlığı tarafından belirlenen değerlere göre
        başvuru yapılabilir.
      </p>

      <h2>13. Yürürlük</h2>
      <p>
        Alıcı, sözleşmenin tüm koşullarını okuyup elektronik ortamda onayladığını
        beyan eder. Sözleşme onay anında yürürlüğe girer.
      </p>

      <h2>14. İletişim</h2>
      <p>
        Sözleşme ile ilgili tüm sorularınız için:{' '}
        <a href="mailto:legal@pushify.dev">legal@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
