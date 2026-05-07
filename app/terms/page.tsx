'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

export default function TermsPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <TermsTR /> : <TermsEN />;
}

function TermsEN() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 3, 2026">
      <h2>1. Parties</h2>
      <p>This Agreement is concluded between the following parties:</p>
      <ul>
        <li><strong>SERVICE PROVIDER:</strong> Pushify (pushify.dev)</li>
        <li><strong>USER:</strong> The natural or legal person who registers and purchases services from this site.</li>
      </ul>

      <h2>2. Subject of the Agreement</h2>
      <p>
        This Agreement governs the rights and obligations of the parties regarding the digital
        services purchased and delivered electronically by the User. It is subject to applicable
        consumer protection regulations.
      </p>

      <h2>3. Service Information</h2>
      <p>Pushify provides cloud-based deployment and server management services to its users.</p>
      <ul>
        <li><strong>Free:</strong> No cost, limited features</li>
        <li><strong>Hobby:</strong> $10/month — individual projects</li>
        <li><strong>Pro:</strong> $30/month — professional teams</li>
        <li><strong>Business:</strong> $100/month — enterprise use</li>
      </ul>
      <p>All prices include applicable taxes. Current pricing is published at <a href="/pricing">/pricing</a>.</p>

      <h2>4. General Provisions</h2>
      <p>
        The User declares that they have read and understood the qualities of the Service, sales
        price, payment method, and all preliminary information regarding performance, and have
        provided the necessary confirmation electronically.
      </p>

      <h2>5. Payment</h2>
      <p>
        Payments are processed by our PCI-DSS compliant payment provider. All payments are
        encrypted with SSL. Card details are never stored on Pushify servers.
      </p>

      <h2>6. Service Delivery</h2>
      <p>
        Service is activated immediately after payment confirmation. As the service is digital,
        there is no physical delivery. Your subscription auto-renews monthly or yearly depending
        on the plan you choose.
      </p>

      <h2>7. Right of Withdrawal</h2>
      <p>
        Per applicable Distance Sales regulations, the right of withdrawal expires once
        performance begins on digital content with the consumer&apos;s consent. That said,
        Pushify offers a <strong>14-day full refund</strong> from your first purchase if you are
        not satisfied. See <a href="/refund">Refund Policy</a> for details.
      </p>

      <h2>8. Obligations of the Parties</h2>
      <h3>8.1. Provider Obligations</h3>
      <ul>
        <li>Provide the service as described in this Agreement</li>
        <li>Strive to meet the 99.9% SLA target</li>
        <li>Keep customer data confidential and backed up</li>
        <li>Provide customer support</li>
      </ul>
      <h3>8.2. User Obligations</h3>
      <ul>
        <li>Keep your account and password secure</li>
        <li>Use the service for lawful purposes</li>
        <li>Respect third-party rights</li>
        <li>Pay your subscription on time</li>
      </ul>

      <h2>9. Prohibited Use</h2>
      <p>Pushify may not be used for:</p>
      <ul>
        <li>Hosting or distributing illegal content</li>
        <li>Spam or malware distribution</li>
        <li>Sharing copyright-infringing material</li>
        <li>DDoS attacks, malicious software, or cryptocurrency mining</li>
        <li>Unauthorized access attempts to third-party systems</li>
      </ul>
      <p>
        In case of violation, Pushify reserves the right to suspend or terminate your account
        without prior notice.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        Pushify does not guarantee that the service will be uninterrupted or error-free. We accept
        no liability for outages caused by upstream providers, force majeure, natural disasters,
        war, terrorism, or similar events. Pushify&apos;s total liability is limited to the fees
        paid in the last 12 months.
      </p>

      <h2>11. Subscription Termination</h2>
      <ul>
        <li>You can cancel your subscription at any time</li>
        <li>You can use the service until the end of the current billing period after cancellation</li>
        <li>When your account is deleted, your data is removed in accordance with our Privacy Policy</li>
      </ul>

      <h2>12. Dispute Resolution</h2>
      <p>
        The laws of the Republic of Türkiye apply to disputes arising from this Agreement. Consumer
        arbitration committees and consumer courts have jurisdiction; applications can be made
        based on values determined annually by the Ministry of Industry and Trade.
      </p>

      <h2>13. Effective Date</h2>
      <p>
        The User declares that they have read all the terms of the Agreement and approved them
        electronically. The Agreement comes into effect at the moment of approval.
      </p>

      <h2>14. Contact</h2>
      <p>For all questions related to this Agreement: <a href="mailto:support@pushify.dev">support@pushify.dev</a></p>
    </LegalPageLayout>
  );
}

function TermsTR() {
  return (
    <LegalPageLayout title="Mesafeli Satış Sözleşmesi">
      <h2>1. Taraflar</h2>
      <p>
        İşbu Mesafeli Satış Sözleşmesi (&ldquo;Sözleşme&rdquo;), aşağıdaki taraflar
        arasında akdedilmiştir:
      </p>
      <ul>
        <li><strong>SATICI:</strong> Pushify (pushify.dev)</li>
        <li><strong>ALICI:</strong> İşbu siteye üye olarak hizmet satın alan gerçek veya tüzel kişi.</li>
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
        <li><strong>Free:</strong> Ücretsiz, sınırlı özellikler</li>
        <li><strong>Hobby:</strong> Aylık 10 USD &mdash; bireysel projeler</li>
        <li><strong>Pro:</strong> Aylık 30 USD &mdash; profesyonel ekipler</li>
        <li><strong>Business:</strong> Aylık 100 USD &mdash; kurumsal kullanım</li>
      </ul>
      <p>
        Tüm fiyatlara KDV dahildir. Güncel fiyatlar <a href="/pricing">/pricing</a> sayfasında yayınlanır.
      </p>

      <h2>4. Genel Hükümler</h2>
      <p>
        Alıcı, satışa konu Hizmetin nitelikleri, satış fiyatı ve ödeme şekli ile
        ifaya ilişkin tüm ön bilgileri okuyup, anladığını ve elektronik ortamda
        gerekli teyidi verdiğini beyan eder.
      </p>

      <h2>5. Ödeme</h2>
      <p>
        Ödemeler PCI-DSS uyumlu ödeme sağlayıcımız üzerinden alınır. Tüm ödemeler
        SSL ile şifrelenir. Kart bilgileri Pushify sunucularında saklanmaz.
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
        Sözleşme ile ilgili tüm sorularınız için: <a href="mailto:support@pushify.dev">support@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
