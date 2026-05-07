'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

export default function PrivacyPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <PrivacyTR /> : <PrivacyEN />;
}

function PrivacyEN() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 3, 2026">
      <p>
        At Pushify, the security of your personal data is important to us. This Privacy Policy
        explains the information we collect when you use Pushify, how we use it, and your rights.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>1.1. Account Information</h3>
      <p>When you create an account we collect:</p>
      <ul>
        <li>Name and email address</li>
        <li>Password (hashed irreversibly)</li>
        <li>Profile picture (optional)</li>
        <li>Identity information from GitHub or Google when you sign in via OAuth</li>
      </ul>

      <h3>1.2. Payment Information</h3>
      <p>
        Payments are processed through our PCI-DSS compliant payment provider. Your card details
        are never stored on our servers — they are handled directly by the provider. We only store
        the payment status, subscription tier, and billing history.
      </p>

      <h3>1.3. Usage Data</h3>
      <ul>
        <li>IP address, browser type, and device information</li>
        <li>Deployment history and activity logs</li>
        <li>Error and performance data</li>
        <li>Server, project, and database usage metrics</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the service</li>
        <li>To manage your account and authenticate you</li>
        <li>To process payments</li>
        <li>To provide customer support</li>
        <li>To improve the service and fix bugs</li>
        <li>To meet our legal obligations</li>
      </ul>

      <h2>3. Who We Share Your Information With</h2>
      <p>
        We <strong>do not sell</strong> your personal data. Information is only shared with
        providers strictly required to deliver the service:
      </p>
      <ul>
        <li>Payment processor — for billing and subscription management</li>
        <li><strong>Hetzner Cloud</strong> — server infrastructure (only when you opt in)</li>
        <li><strong>Anthropic</strong> — AI Assistant feature (only the messages you explicitly send)</li>
        <li>Legal authorities — only when legally required</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>While your account is active, your data is retained. When you delete your account:</p>
      <ul>
        <li>Profile and account data are deleted within 30 days</li>
        <li>Activity logs are deleted within 90 days</li>
        <li>Invoice and payment records are retained for 10 years (legal obligation)</li>
        <li>Data temporarily present in backups is purged within 60 days</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        Our site uses cookies for session management, preference memory, and security. We do not
        use third-party advertising cookies. You can manage cookies via your browser settings.
      </p>

      <h2>6. Data Security</h2>
      <ul>
        <li>All connections are encrypted with HTTPS / TLS 1.3</li>
        <li>Passwords are hashed with bcrypt</li>
        <li>SSH private keys are stored encrypted with AES-256</li>
        <li>Regular security audits and penetration tests</li>
        <li>Our servers are hosted in ISO 27001 certified data centers</li>
      </ul>

      <h2>7. Your Rights (GDPR / KVKK)</h2>
      <p>Under applicable data protection laws you have the right to:</p>
      <ul>
        <li>Know whether your personal data is being processed</li>
        <li>Request a copy of your processed data</li>
        <li>Ask for correction, deletion, or destruction of your data</li>
        <li>Object to automated decision-making based on your data</li>
        <li>Request data portability</li>
      </ul>
      <p>
        To exercise these rights please contact <a href="mailto:support@pushify.dev">support@pushify.dev</a>.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        Pushify is not directed to people under 18. We do not knowingly collect data from users
        under 18.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Significant changes will be notified by email,
        and the update date appears at the top of the page.
      </p>

      <h2>10. Contact</h2>
      <p>
        For all privacy-related questions: <a href="mailto:support@pushify.dev">support@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}

function PrivacyTR() {
  return (
    <LegalPageLayout title="Gizlilik Sözleşmesi">
      <p>
        Pushify olarak kişisel verilerinizin güvenliği bizim için önemlidir. Bu
        gizlilik sözleşmesi, Pushify hizmetlerini kullanırken topladığımız bilgileri,
        bunları nasıl kullandığımızı ve haklarınızı açıklar.
      </p>

      <h2>1. Topladığımız Bilgiler</h2>
      <h3>1.1. Hesap Bilgileri</h3>
      <p>Hesap oluşturduğunuzda şu bilgileri toplarız:</p>
      <ul>
        <li>Ad, soyad ve e-posta adresi</li>
        <li>Şifre (geri döndürülemez şekilde hash&apos;lenmiş olarak)</li>
        <li>Profil fotoğrafı (opsiyonel)</li>
        <li>GitHub veya Google ile giriş yaptıysanız ilgili sağlayıcıdan alınan kimlik bilgileri</li>
      </ul>

      <h3>1.2. Ödeme Bilgileri</h3>
      <p>
        Ödemeler PCI-DSS uyumlu ödeme sağlayıcımız üzerinden gerçekleşir. Kart
        bilgileriniz sunucularımızda saklanmaz; doğrudan sağlayıcı tarafından işlenir.
        Biz yalnızca ödeme durumunu, abonelik tipini ve fatura geçmişini saklarız.
      </p>

      <h3>1.3. Kullanım Verileri</h3>
      <ul>
        <li>IP adresi, tarayıcı türü ve cihaz bilgileri</li>
        <li>Dağıtım (deployment) geçmişi ve aktivite logları</li>
        <li>Hata ve performans verileri</li>
        <li>Sunucu, proje ve veritabanı kullanım metrikleri</li>
      </ul>

      <h2>2. Bilgileri Nasıl Kullanıyoruz?</h2>
      <ul>
        <li>Hizmeti sağlamak ve sürdürmek için</li>
        <li>Hesabınızı yönetmek ve kimliğinizi doğrulamak için</li>
        <li>Ödeme işlemlerini gerçekleştirmek için</li>
        <li>Müşteri destek hizmeti sunmak için</li>
        <li>Hizmeti iyileştirmek ve hata gidermek için</li>
        <li>Yasal yükümlülüklerimizi yerine getirmek için</li>
      </ul>

      <h2>3. Bilgileri Kimlerle Paylaşıyoruz?</h2>
      <p>
        Kişisel verilerinizi <strong>üçüncü taraflara satmıyoruz</strong>. Bilgileriniz
        yalnızca hizmetin sağlanması için zorunlu olan tedarikçilerle paylaşılır:
      </p>
      <ul>
        <li>Ödeme sağlayıcımız — fatura ve abonelik yönetimi için</li>
        <li><strong>Hetzner Cloud</strong> — sunucu altyapısı (yalnızca isteğe bağlı kullanım)</li>
        <li><strong>Anthropic</strong> — AI Asistan özelliği için (yalnızca açıkça gönderdiğiniz mesajlar)</li>
        <li>Yasal merciler — yalnızca yasal zorunluluk halinde</li>
      </ul>

      <h2>4. Veri Saklama Süresi</h2>
      <p>Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı sildiğinizde:</p>
      <ul>
        <li>Profil ve hesap verileri 30 gün içinde silinir</li>
        <li>Aktivite logları 90 gün içinde silinir</li>
        <li>Fatura ve ödeme kayıtları yasal zorunluluk gereği 10 yıl saklanır</li>
        <li>Yedeklerde geçici olarak bulunan veriler en fazla 60 gün içinde temizlenir</li>
      </ul>

      <h2>5. Çerezler (Cookies)</h2>
      <p>
        Sitemiz oturum yönetimi, tercih hatırlama ve güvenlik amaçlı çerezler kullanır.
        Üçüncü taraf reklam çerezi kullanmıyoruz. Tarayıcı ayarlarınızdan çerezleri
        yönetebilirsiniz.
      </p>

      <h2>6. Veri Güvenliği</h2>
      <ul>
        <li>Tüm bağlantılar HTTPS / TLS 1.3 ile şifrelenir</li>
        <li>Şifreler bcrypt ile hash&apos;lenir</li>
        <li>SSH özel anahtarlar AES-256 ile şifreli saklanır</li>
        <li>Düzenli güvenlik denetimleri ve sızma testleri yapılır</li>
        <li>Sunucularımız ISO 27001 sertifikalı veri merkezlerinde barındırılır</li>
      </ul>

      <h2>7. KVKK Kapsamındaki Haklarınız</h2>
      <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında şu haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenen verilerinizi talep etme</li>
        <li>Verilerin düzeltilmesini, silinmesini veya yok edilmesini isteme</li>
        <li>Otomatik sistemler ile analiz edilen verilere itiraz etme</li>
        <li>Veri taşınabilirliği talebinde bulunma</li>
      </ul>
      <p>
        Bu haklarınızı kullanmak için <a href="mailto:support@pushify.dev">support@pushify.dev</a> adresine başvurabilirsiniz.
      </p>

      <h2>8. Çocukların Gizliliği</h2>
      <p>
        Pushify 18 yaşın altındaki kişilere yönelik bir hizmet değildir. 18 yaş altı
        kullanıcılardan bilerek veri toplamayız.
      </p>

      <h2>9. Sözleşmedeki Değişiklikler</h2>
      <p>
        Bu sözleşmede zaman zaman değişiklik yapabiliriz. Önemli değişiklikleri
        e-posta ile bildiririz ve güncelleme tarihi sayfanın başında gösterilir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Gizlilik ile ilgili tüm sorularınız için: <a href="mailto:support@pushify.dev">support@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
