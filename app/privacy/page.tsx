'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function PrivacyPage() {
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
        Ödemeler <strong>iyzico</strong> üzerinden gerçekleşir. Kart bilgileriniz
        sunucularımızda saklanmaz; doğrudan iyzico tarafından işlenir ve PCI-DSS
        uyumlu bir şekilde korunur. Biz yalnızca ödeme durumunu, abonelik tipini
        ve fatura geçmişini saklarız.
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
        <li>
          <strong>iyzico</strong> — ödeme işleme
        </li>
        <li>
          <strong>Hetzner Cloud</strong> — sunucu altyapısı (yalnızca isteğe bağlı kullanım)
        </li>
        <li>
          <strong>Anthropic</strong> — AI Asistan özelliği için (yalnızca açıkça
          gönderdiğiniz mesajlar)
        </li>
        <li>Yasal merciler — yalnızca yasal zorunluluk halinde</li>
      </ul>

      <h2>4. Veri Saklama Süresi</h2>
      <p>
        Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı sildiğinizde:
      </p>
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
        Bu haklarınızı kullanmak için <a href="mailto:privacy@pushify.dev">privacy@pushify.dev</a>{' '}
        adresine başvurabilirsiniz.
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
        Gizlilik ile ilgili tüm sorularınız için:{' '}
        <a href="mailto:privacy@pushify.dev">privacy@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
