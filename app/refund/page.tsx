'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export default function RefundPage() {
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
        Ödemeniz iyzico tarafından onaylandıktan <strong>hemen sonra</strong>{' '}
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

      <h2>4. İade Talebi Nasıl Yapılır?</h2>
      <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>
          <a href="mailto:billing@pushify.dev">billing@pushify.dev</a> adresine
          e-posta gönderin
        </li>
        <li>Hesap e-postanızı, fatura numaranızı ve iade nedeninizi yazın</li>
        <li>
          Ekibimiz <strong>2 iş günü içinde</strong> talebinizi inceler
        </li>
        <li>İade onaylanırsa süreç başlatılır</li>
      </ol>

      <h2>5. İade Süresi</h2>
      <p>
        İadeler ödeme yaptığınız <strong>aynı kart veya hesaba</strong> yapılır.
        İade süreleri:
      </p>
      <ul>
        <li>
          <strong>Kredi/Banka kartı:</strong> 7&ndash;14 iş günü (banka süreci dahil)
        </li>
        <li>
          <strong>iyzico cüzdan:</strong> 1&ndash;3 iş günü
        </li>
      </ul>
      <p>
        İade işlemi tarafımızdan başlatıldıktan sonra bankanızın işleme alma süresi
        bizim kontrolümüz dışındadır.
      </p>

      <h2>6. Aboneliğin İptali</h2>
      <p>
        İade hakkından bağımsız olarak, aboneliğinizi istediğiniz zaman iptal
        edebilirsiniz:
      </p>
      <ul>
        <li>
          Pushify dashboard &rarr; <strong>Billing</strong> &rarr;{' '}
          <strong>Manage subscription</strong>
        </li>
        <li>
          İptal sonrası mevcut faturalama dönemi sonuna kadar hizmet kullanılabilir
        </li>
        <li>Otomatik yenileme durur, sonraki dönemde ücret alınmaz</li>
        <li>
          Verileriniz <strong>30 gün</strong> boyunca saklanır, bu sürede yeniden
          abone olabilirsiniz
        </li>
      </ul>

      <h2>7. Plan Değişiklikleri</h2>
      <h3>7.1. Yükseltme (Upgrade)</h3>
      <p>
        Daha üst bir plana geçtiğinizde, kalan günlerin ücreti orantılı olarak
        hesaplanır ve aradaki fark anında alınır. Yeni plan özellikleri hemen
        kullanılabilir.
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
        Faturalama, iade veya iptal süreçleri için:{' '}
        <a href="mailto:billing@pushify.dev">billing@pushify.dev</a>
      </p>
    </LegalPageLayout>
  );
}
