'use client';

import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

/**
 * How to leave Pushify: what keeps running, what you can take, and our shutdown notice.
 * Every statement maps to code (checked 2026-09-29): env masking in envvar.service, backup
 * download in routes/databases, `--restart unless-stopped` in the deploy workers, the wake proxy
 * in nginx-manager, root key download in routes/servers, selfhost/install.sh. Keep it that way,
 * and move an item out of "Not there yet" only when it ships.
 */
export default function ExitPlanPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <ExitPlanTR /> : <ExitPlanEN />;
}

const INSTALL_CMD = 'curl -fsSL https://raw.githubusercontent.com/pushifydev/pushify_backend/master/selfhost/install.sh | bash';
const SELF_HOSTING_GUIDE = 'https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md';

function ExitPlanEN() {
  return (
    <LegalPageLayout title="Exit plan" lastUpdated="September 29, 2026">
      <p>
        You should be able to leave without asking us. This page says what keeps running without Pushify, what you can
        take with you today, and what we promise if we shut the hosted service down. Where something is missing, it
        says so.
      </p>

      <h2>1. Notice before a shutdown</h2>
      <p>
        If we shut down the hosted service at pushify.dev, we will tell every account owner by email and on this site{' '}
        <strong>at least 90 days</strong> before. For those 90 days the dashboard, the API and every export on this
        page keep working. Pushify is MIT licensed and its code stays public on GitHub, so you can keep running it
        yourself after that.
      </p>

      <h2>2. What keeps running without Pushify</h2>
      <p>
        <strong>On servers you connected,</strong> apps and databases are plain Docker containers started with{' '}
        <code>--restart unless-stopped</code>, behind nginx on the same server, with certbot renewing certificates
        there. Nothing on the server calls back to Pushify to stay up.
      </p>
      <p>What stops with the control plane:</p>
      <ul>
        <li>deploys, scheduled jobs, database backups, health checks and autoscaling;</li>
        <li>apps that are asleep: the wake-up request goes through Pushify, so turn sleep off before you leave.</li>
      </ul>
      <p>
        <strong>On Pushify&rsquo;s infrastructure,</strong> things go away with the service: managed servers (they
        live in Pushify&rsquo;s Hetzner account), sites on Pushify&rsquo;s shared hosting, and{' '}
        <code>*.pushify.dev</code> addresses.
      </p>

      <h2>3. Taking your things</h2>
      <ul>
        <li>
          <strong>Code</strong> stays in your Git repository; Pushify only reads it.
        </li>
        <li>
          <strong>Environment variables:</strong> <code>pushify env pull</code> writes a <code>.env</code> file.
          Values marked secret come out masked (<code>ab****yz</code>), so keep your own copy of secrets, or read them on
          your server with <code>docker inspect</code>.
        </li>
        <li>
          <strong>Databases:</strong> download any backup from the database page. They are standard formats:{' '}
          <code>pg_dump</code> and <code>mysqldump</code> (gzip), a <code>mongodump</code> archive, Redis{' '}
          <code>dump.rdb</code>. Restore them with the usual tools.
        </li>
        <li>
          <strong>Logs:</strong> runtime logs download from a project&rsquo;s Logs tab. Build logs can be read but not
          downloaded.
        </li>
        <li>
          <strong>Managed servers:</strong> download the root SSH key from the server page and copy off what you need.
          They cannot be moved into your own Hetzner account. They are deleted when you delete them, and powered off
          when your plan ends or your balance runs out.
        </li>
        <li>
          <strong>Servers you connected:</strong> deleting one removes Pushify&rsquo;s SSH key; the{' '}
          <Link href="/security">security page</Link> has a script that removes the rest.
        </li>
      </ul>

      <h2>4. Moving to self-hosted Pushify</h2>
      <p>The same software runs on your own machine with one command:</p>
      <pre>
        <code>{INSTALL_CMD}</code>
      </pre>
      <p>
        Then connect your servers again over SSH, recreate your projects from the same repositories (a{' '}
        <code>pushify.yaml</code> in the repo carries its settings), paste your <code>.env</code>, and restore your
        database backups. There is no importer yet. Managed servers and automatic subdomains need accounts of your
        own (a Hetzner API token, a domain). The <a href={SELF_HOSTING_GUIDE}>self-hosting guide</a> covers the setup.
      </p>

      <h2>5. Not there yet</h2>
      <ul>
        <li>No button to delete your account or organization: email <a href="mailto:support@pushify.dev">support@pushify.dev</a> to have it deleted.</li>
        <li>No export of project settings or a generated <code>pushify.yaml</code>.</li>
        <li>Uploaded static sites cannot be downloaded; keep the original files.</li>
        <li>Built images stay on the server that built them; they are not pushed to a registry you own.</li>
        <li>Secret environment variables are masked in exports.</li>
      </ul>
    </LegalPageLayout>
  );
}

function ExitPlanTR() {
  return (
    <LegalPageLayout title="Çıkış planı" lastUpdated="29 Eylül 2026">
      <p>
        Bizden izin istemeden ayrılabilmelisiniz. Bu sayfa Pushify olmadan neyin çalışmaya devam ettiğini, bugün neleri
        yanınızda götürebileceğinizi ve barındırılan hizmeti kapatırsak ne söz verdiğimizi anlatır. Eksik olan bir şey
        varsa bunu da söyler.
      </p>

      <h2>1. Kapatmadan önce bildirim</h2>
      <p>
        pushify.dev&rsquo;deki barındırılan hizmeti kapatırsak her hesap sahibine e-postayla ve bu sitede{' '}
        <strong>en az 90 gün</strong> önceden haber veririz. Bu 90 gün boyunca panel, API ve bu sayfadaki tüm dışa
        aktarma yolları çalışmaya devam eder. Pushify MIT lisanslıdır ve kodu GitHub&rsquo;da açık kalır; sonrasında
        kendiniz çalıştırmaya devam edebilirsiniz.
      </p>

      <h2>2. Pushify olmadan ne çalışmaya devam eder</h2>
      <p>
        <strong>Bağladığınız sunucularda</strong> uygulamalar ve veritabanları <code>--restart unless-stopped</code> ile
        başlatılmış sıradan Docker container&rsquo;larıdır; önlerinde aynı sunucudaki nginx vardır ve sertifikaları
        orada certbot yeniler. Sunucudaki hiçbir şey ayakta kalmak için Pushify&rsquo;a bağlanmaz.
      </p>
      <p>Kontrol paneliyle birlikte duranlar:</p>
      <ul>
        <li>deploy&rsquo;lar, zamanlanmış görevler, veritabanı yedekleri, sağlık kontrolleri ve otomatik ölçekleme;</li>
        <li>uyku modundaki uygulamalar: uyandırma isteği Pushify üzerinden geçer, ayrılmadan önce uyku modunu kapatın.</li>
      </ul>
      <p>
        <strong>Pushify&rsquo;ın altyapısındakiler</strong> hizmetle birlikte gider: yönetilen sunucular
        (Pushify&rsquo;ın Hetzner hesabındadır), Pushify&rsquo;ın paylaşımlı barındırmasındaki siteler ve{' '}
        <code>*.pushify.dev</code> adresleri.
      </p>

      <h2>3. Verilerinizi almak</h2>
      <ul>
        <li>
          <strong>Kod</strong> Git deponuzda kalır; Pushify yalnızca okur.
        </li>
        <li>
          <strong>Ortam değişkenleri:</strong> <code>pushify env pull</code> bir <code>.env</code> dosyası yazar. Gizli
          olarak işaretlenen değerler maskeli gelir (<code>ab****yz</code>); gizli değerlerin kendi kopyanızı saklayın ya
          da sunucunuzda <code>docker inspect</code> ile okuyun.
        </li>
        <li>
          <strong>Veritabanları:</strong> veritabanı sayfasından herhangi bir yedeği indirin. Standart formatlardadır:{' '}
          <code>pg_dump</code> ve <code>mysqldump</code> (gzip), <code>mongodump</code> arşivi, Redis{' '}
          <code>dump.rdb</code>. Bilinen araçlarla geri yükleyin.
        </li>
        <li>
          <strong>Loglar:</strong> çalışma logları projenin Loglar sekmesinden indirilir. Build logları okunabilir ama
          indirilemez.
        </li>
        <li>
          <strong>Yönetilen sunucular:</strong> sunucu sayfasından root SSH anahtarını indirin ve ihtiyacınız olanı
          kopyalayın. Kendi Hetzner hesabınıza taşınamazlar. Siz silince silinirler; planınız bitince ya da bakiyeniz
          tükenince kapatılırlar.
        </li>
        <li>
          <strong>Bağladığınız sunucular:</strong> silmek Pushify&rsquo;ın SSH anahtarını kaldırır; geri kalanını
          kaldıran betik <Link href="/security">güvenlik sayfasında</Link>.
        </li>
      </ul>

      <h2>4. Self-host Pushify&rsquo;a geçmek</h2>
      <p>Aynı yazılım tek komutla kendi makinenizde çalışır:</p>
      <pre>
        <code>{INSTALL_CMD}</code>
      </pre>
      <p>
        Ardından sunucularınızı SSH ile yeniden bağlayın, projelerinizi aynı depolardan yeniden oluşturun (depodaki{' '}
        <code>pushify.yaml</code> ayarlarını taşır), <code>.env</code> dosyanızı yapıştırın ve veritabanı yedeklerinizi
        geri yükleyin. Henüz otomatik aktarıcı yok. Yönetilen sunucular ve otomatik alt alan adları için kendi
        hesaplarınız gerekir (Hetzner API token&rsquo;ı, bir domain). Kurulum{' '}
        <a href={SELF_HOSTING_GUIDE}>self-host rehberinde</a> anlatılıyor.
      </p>

      <h2>5. Henüz olmayanlar</h2>
      <ul>
        <li>Hesabı ya da organizasyonu silme düğmesi yok: silinmesi için <a href="mailto:support@pushify.dev">support@pushify.dev</a> adresine yazın.</li>
        <li>Proje ayarları ya da üretilmiş bir <code>pushify.yaml</code> dışa aktarılamıyor.</li>
        <li>Yüklenen statik siteler indirilemiyor; orijinal dosyaları saklayın.</li>
        <li>Build edilen imajlar onları build eden sunucuda kalır; sizin registry&rsquo;nize gönderilmez.</li>
        <li>Gizli ortam değişkenleri dışa aktarımda maskelenir.</li>
      </ul>
    </LegalPageLayout>
  );
}
