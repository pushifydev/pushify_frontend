'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

export default function RefundPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <RefundTR /> : <RefundEN />;
}

function RefundEN() {
  return (
    <LegalPageLayout title="Delivery & Refund Policy" lastUpdated="May 3, 2026">
      <h2>1. Service Type</h2>
      <p>
        Pushify is a subscription-based SaaS platform offering cloud deployment and server
        management services. We do not sell physical products. &ldquo;Delivery&rdquo; therefore
        refers to the digital service being provided electronically.
      </p>

      <h2>2. Delivery Time</h2>
      <p>
        Once your payment is confirmed, your account is upgraded to the relevant plan
        <strong> immediately</strong>. There is no waiting period — all service features become
        usable instantly.
      </p>

      <h2>3. Refund Policy</h2>
      <h3>3.1. 14-Day Satisfaction Guarantee</h3>
      <p>
        If you are not satisfied with your first subscription, you may request a full refund
        <strong> within 14 days of purchase</strong>. No reason needs to be provided during
        this period.
      </p>

      <h3>3.2. Non-Refundable Cases</h3>
      <ul>
        <li>Cancellation requests made after the 14-day period</li>
        <li>Auto-renewal periods after the first purchase</li>
        <li>Accounts terminated for violation of terms</li>
        <li>Repeat purchases on previously refunded accounts</li>
      </ul>

      <h3>3.3. Infrastructure credits (managed Hetzner)</h3>
      <p>
        Managed cloud servers are billed from a <strong>prepaid infrastructure credits</strong>{' '}
        wallet, separate from your platform subscription. Credits are consumed hourly while servers
        run. One-time top-ups through Stripe are generally <strong>non-refundable</strong> once
        credited, including if a server stops because the balance reached zero. Contact support if
        you believe a top-up was charged in error.
      </p>

      <h2>4. How to Request a Refund</h2>
      <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Email <a href="mailto:support@pushify.dev">support@pushify.dev</a></li>
        <li>Include your account email, invoice number, and reason</li>
        <li>Our team reviews your request within <strong>2 business days</strong></li>
        <li>If approved, the refund process is initiated</li>
      </ol>

      <h2>5. Refund Time</h2>
      <p>Refunds are processed back to the <strong>same card or account</strong> used for payment:</p>
      <ul>
        <li><strong>Credit/Debit card:</strong> 7&ndash;14 business days (including bank processing)</li>
      </ul>
      <p>
        Once we initiate the refund, the time taken by your bank to process it is outside our
        control.
      </p>

      <h2>6. Subscription Cancellation</h2>
      <p>
        Independent of refund eligibility, you can cancel your subscription at any time:
      </p>
      <ul>
        <li>Pushify dashboard &rarr; <strong>Billing</strong> &rarr; <strong>Manage subscription</strong></li>
        <li>After cancellation, you can use the service until the end of the current billing period</li>
        <li>Auto-renewal stops; no further charges will occur</li>
        <li>When the subscription ends, your plan becomes Free: managed Hetzner servers are stopped and active projects are paused until you resubscribe</li>
        <li>Your data is retained for <strong>30 days</strong>, allowing you to resubscribe within that window</li>
      </ul>

      <h2>7. Plan Changes</h2>
      <h3>7.1. Upgrade</h3>
      <p>
        When you upgrade, the prorated cost of remaining days is calculated and charged immediately.
        New plan features are available right away.
      </p>
      <h3>7.2. Downgrade</h3>
      <p>
        When you downgrade, current billing period continues with the existing plan&apos;s
        features. The next billing cycle starts at the new lower price.
      </p>

      <h2>8. Auto-Renewal</h2>
      <p>
        Your subscription auto-renews based on your chosen cycle (monthly or yearly). To stop
        renewal you must cancel at least <strong>24 hours before</strong> the end of your billing
        period.
      </p>

      <h2>9. Force Majeure</h2>
      <p>
        In cases of natural disasters, war, terrorism, pandemics, government actions, internet
        infrastructure issues, or similar force majeure events, service interruptions may occur.
        These do not give rise to a refund right.
      </p>

      <h2>10. Contact</h2>
      <p>
        For billing, refund, or cancellation: <a href="mailto:support@pushify.dev">support@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}

function RefundTR() {
  return (
    <LegalPageLayout title="Teslimat ve İade Şartları">
      <h2>1. Hizmet Türü</h2>
      <p>
        Pushify, dijital bulut yayınlama (deployment) ve sunucu yönetimi hizmeti
        sunan abonelik tabanlı bir SaaS platformudur. Fiziksel ürün satışı yapılmaz.
        Bu nedenle &ldquo;teslimat&rdquo; ifadesi, dijital hizmetin elektronik
        ortamda sağlanması anlamına gelir.
      </p>

      <h2>2. Teslimat Süresi</h2>
      <p>
        Ödemeniz onaylandıktan <strong>hemen sonra</strong>{' '}
        hesabınız ilgili plana yükseltilir. Bekleme süresi yoktur. Tüm hizmet
        özellikleri anında kullanılabilir hale gelir.
      </p>

      <h2>3. İade Politikası</h2>
      <h3>3.1. 14 Gün Memnuniyet Garantisi</h3>
      <p>
        İlk satın aldığınız aboneliğinizden memnun kalmazsanız,{' '}
        <strong>satın alma tarihinden itibaren 14 gün içinde</strong> tam iade
        talep edebilirsiniz. Bu süre içinde herhangi bir gerekçe açıklamanıza
        gerek yoktur.
      </p>

      <h3>3.2. İade Edilemeyen Durumlar</h3>
      <ul>
        <li>14 günlük süre dolduktan sonra yapılan iptal talepleri</li>
        <li>İlk satın alımdan sonraki yenileme dönemleri (otomatik yenilemeler)</li>
        <li>Hizmet şartlarının ihlali nedeniyle hesap kapatılan durumlar</li>
        <li>Önceden iade alınmış hesaplara yapılan tekrar satın almalar</li>
      </ul>

      <h3>3.3. Altyapı kredileri (yönetilen Hetzner)</h3>
      <p>
        Yönetilen bulut sunucuları, platform aboneliğinden ayrı{' '}
        <strong>ön ödemeli altyapı kredileri</strong> cüzdanından faturalandırılır. Sunucu
        çalışırken krediler saatlik düşer. Stripe ile yapılan tek seferlik yüklemeler genelde
        cüzdana aktarıldıktan sonra <strong>iade edilmez</strong>; bakiye sıfırlanınca sunucunun
        durması da buna dahildir. Hatalı tahsilat olduğunu düşünüyorsanız destek ile iletişime geçin.
      </p>

      <h2>4. İade Talebi Nasıl Yapılır?</h2>
      <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li><a href="mailto:support@pushify.dev">support@pushify.dev</a> adresine e-posta gönderin</li>
        <li>Hesap e-postanızı, fatura numaranızı ve iade nedeninizi yazın</li>
        <li>Ekibimiz <strong>2 iş günü içinde</strong> talebinizi inceler</li>
        <li>İade onaylanırsa süreç başlatılır</li>
      </ol>

      <h2>5. İade Süresi</h2>
      <p>İadeler ödeme yaptığınız <strong>aynı kart veya hesaba</strong> yapılır:</p>
      <ul>
        <li><strong>Kredi/Banka kartı:</strong> 7&ndash;14 iş günü (banka süreci dahil)</li>
      </ul>
      <p>
        İade işlemi tarafımızdan başlatıldıktan sonra bankanızın işleme alma süresi
        bizim kontrolümüz dışındadır.
      </p>

      <h2>6. Aboneliğin İptali</h2>
      <p>
        İade hakkından bağımsız olarak, aboneliğinizi istediğiniz zaman iptal edebilirsiniz:
      </p>
      <ul>
        <li>Pushify dashboard &rarr; <strong>Billing</strong> &rarr; <strong>Manage subscription</strong></li>
        <li>İptal sonrası mevcut faturalama dönemi sonuna kadar hizmet kullanılabilir</li>
        <li>Otomatik yenileme durur, sonraki dönemde ücret alınmaz</li>
        <li>Abonelik bittiğinde plan Ücretsiz olur: yönetilen Hetzner sunucuları durur, aktif projeler duraklatılır</li>
        <li>Verileriniz <strong>30 gün</strong> boyunca saklanır, bu sürede yeniden abone olabilirsiniz</li>
      </ul>

      <h2>7. Plan Değişiklikleri</h2>
      <h3>7.1. Yükseltme (Upgrade)</h3>
      <p>
        Daha üst bir plana geçtiğinizde, kalan günlerin ücreti orantılı olarak
        hesaplanır ve aradaki fark anında alınır. Yeni plan özellikleri hemen kullanılabilir.
      </p>
      <h3>7.2. Düşürme (Downgrade)</h3>
      <p>
        Daha alt bir plana geçtiğinizde, mevcut faturalama dönemi sonuna kadar üst
        plan özellikleri kullanılabilir. Sonraki dönem yeni plan ücretiyle başlar.
      </p>

      <h2>8. Otomatik Yenileme</h2>
      <p>
        Aboneliğiniz seçtiğiniz periyoda göre (aylık veya yıllık) otomatik olarak
        yenilenir. Yenilemeyi durdurmak için faturalama döneminin sona ermesinden
        en az <strong>24 saat önce</strong> iptal yapmanız gerekir.
      </p>

      <h2>9. Mücbir Sebepler</h2>
      <p>
        Doğal afet, savaş, terör, salgın, devlet kararı, internet altyapı sorunları
        veya benzeri mücbir sebep hallerinde hizmette kesintiler olabilir. Bu
        durumlar iade hakkı doğurmaz.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Faturalama, iade veya iptal süreçleri için: <a href="mailto:support@pushify.dev">support@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
