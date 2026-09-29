'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

/**
 * What we do to keep accounts, secrets and servers safe — and what we do not do yet.
 * Every statement here maps to code in pushify_backend; keep it that way when editing.
 */
export default function SecurityPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <SecurityTR /> : <SecurityEN />;
}

const REPO_SECURITY = 'https://github.com/pushifydev/pushify_backend/security';

function SecurityEN() {
  return (
    <LegalPageLayout title="Security" lastUpdated="September 29, 2026">
      <h2>1. Reporting a vulnerability</h2>
      <p>
        Please do not open a public issue. Email <a href="mailto:support@pushify.dev">support@pushify.dev</a> with
        steps to reproduce, impact and the affected component, or use GitHub&rsquo;s{' '}
        <a href={REPO_SECURITY}>private vulnerability reporting</a>. We acknowledge reports within{' '}
        <strong>72 hours</strong>, work with you on a fix and coordinate disclosure. Credit is given unless you
        prefer otherwise. Machine-readable contact details are in{' '}
        <a href="/.well-known/security.txt">/.well-known/security.txt</a>.
      </p>
      <p>
        In scope: the platform, dashboard, API, CLI and installer. Escaping container isolation and anything that
        exposes stored secrets are especially valuable. Applications our users deploy are out of scope.
      </p>

      <h2>2. Where we are today</h2>
      <p>
        Pushify is in beta and run by a very small team. We do not hold SOC 2 or ISO 27001 certification. Security
        fixes land on the latest release; self-hosters should keep up with it, because earlier betas are not patched
        retroactively.
      </p>

      <h2>3. Accounts</h2>
      <ul>
        <li>Passwords are hashed with Argon2id.</li>
        <li>Two-factor authentication with an authenticator app, plus backup codes.</li>
        <li>
          Organizations can sign in through any OIDC identity provider (Okta, Entra ID, Google Workspace, Auth0,
          Keycloak) and require it for their email domains.
        </li>
      </ul>

      <h2>4. Secrets</h2>
      <p>
        Environment variables, SSH private keys, database passwords and access tokens are encrypted at rest with
        AES-256-GCM. Off-site database backups can additionally be encrypted with rclone&rsquo;s <code>crypt</code>{' '}
        before they leave the control plane.
      </p>

      <h2>5. What Pushify does on your server</h2>
      <p>When you connect a server over SSH, Pushify:</p>
      <ul>
        <li>connects as <code>root</code> and appends its own public key to <code>~/.ssh/authorized_keys</code> (the key&rsquo;s comment starts with <code>pushify-</code>);</li>
        <li>installs Docker, nginx and certbot, and creates <code>/opt/pushify</code>;</li>
        <li>
          installs <code>ufw</code>, <strong>resets its existing rules</strong>, denies incoming traffic by default and
          allows ports 22, 80 and 443 (plus the port of any app you deploy without a domain);
        </li>
        <li>writes its own nginx configuration, replacing <code>/etc/nginx/nginx.conf</code> and the default site.</li>
      </ul>
      <p>
        Connect a server you dedicate to Pushify rather than one already running other services. Metrics are read
        over the same SSH connection; no agent or telemetry is installed.
      </p>
      <p>
        <strong>Removing a server from Pushify does not yet remove our key.</strong> Delete the line ending in{' '}
        <code>pushify-&hellip;</code> from <code>/root/.ssh/authorized_keys</code> yourself. Automatic removal is
        on our list.
      </p>

      <h2>6. Isolation on shared runners</h2>
      <p>
        On servers that host more than one customer, apps run on a dedicated Docker network with inter-container
        traffic off. Firewall rules drop traffic from one app to another, to private and link-local ranges and to the
        host, except the host&rsquo;s own ports 80 and 443. Apps with a domain are only reachable through nginx.
      </p>

      <h2>7. AI assistant</h2>
      <p>
        The dashboard assistant is powered by Anthropic. It receives the messages you type and the name of the
        dashboard page you are on. It does not automatically receive your environment variables, logs or source
        code. Only paste what you are comfortable sharing.
      </p>
    </LegalPageLayout>
  );
}

function SecurityTR() {
  return (
    <LegalPageLayout title="Güvenlik" lastUpdated="29 Eylül 2026">
      <h2>1. Güvenlik açığı bildirmek</h2>
      <p>
        Lütfen herkese açık issue açmayın. Yeniden üretme adımları, etki ve etkilenen bileşenle birlikte{' '}
        <a href="mailto:support@pushify.dev">support@pushify.dev</a> adresine yazın ya da GitHub&rsquo;ın{' '}
        <a href={REPO_SECURITY}>gizli açık bildirimini</a> kullanın. Bildirimleri <strong>72 saat</strong> içinde
        onaylarız, düzeltme üzerinde sizinle çalışır ve açıklamayı birlikte planlarız. İstemediğiniz sürece adınızı
        anarız. Makine tarafından okunabilir iletişim bilgisi{' '}
        <a href="/.well-known/security.txt">/.well-known/security.txt</a> dosyasındadır.
      </p>
      <p>
        Kapsam: platform, panel, API, CLI ve kurulum betiği. Container izolasyonundan kaçış ve saklanan sırları açığa
        çıkaran her şey özellikle değerlidir. Kullanıcılarımızın deploy ettiği uygulamalar kapsam dışıdır.
      </p>

      <h2>2. Bugün neredeyiz</h2>
      <p>
        Pushify beta aşamasında ve çok küçük bir ekip tarafından yürütülüyor. SOC 2 veya ISO 27001 sertifikamız yok.
        Güvenlik düzeltmeleri en son sürüme girer; eski betalara geriye dönük yama yapılmadığı için self-host
        edenlerin güncel kalması gerekir.
      </p>

      <h2>3. Hesaplar</h2>
      <ul>
        <li>Parolalar Argon2id ile hash&rsquo;lenir.</li>
        <li>Authenticator uygulamasıyla iki adımlı doğrulama ve yedek kodlar.</li>
        <li>
          Organizasyonlar herhangi bir OIDC kimlik sağlayıcısıyla (Okta, Entra ID, Google Workspace, Auth0, Keycloak)
          giriş yapabilir ve bunu kendi e-posta alan adları için zorunlu kılabilir.
        </li>
      </ul>

      <h2>4. Sırlar</h2>
      <p>
        Ortam değişkenleri, SSH özel anahtarları, veritabanı parolaları ve erişim token&rsquo;ları diskte AES-256-GCM
        ile şifrelenir. Sunucu dışı veritabanı yedekleri, kontrol panelinden çıkmadan önce ayrıca rclone{' '}
        <code>crypt</code> ile şifrelenebilir.
      </p>

      <h2>5. Pushify sunucunuzda ne yapar</h2>
      <p>Bir sunucuyu SSH ile bağladığınızda Pushify:</p>
      <ul>
        <li><code>root</code> olarak bağlanır ve kendi açık anahtarını <code>~/.ssh/authorized_keys</code> dosyasına ekler (anahtarın yorumu <code>pushify-</code> ile başlar);</li>
        <li>Docker, nginx ve certbot kurar, <code>/opt/pushify</code> dizinini oluşturur;</li>
        <li>
          <code>ufw</code> kurar, <strong>mevcut kurallarını sıfırlar</strong>, gelen trafiği varsayılan olarak reddeder
          ve 22, 80, 443 portlarına (ve domainsiz deploy ettiğiniz uygulamaların portuna) izin verir;
        </li>
        <li>kendi nginx yapılandırmasını yazar; <code>/etc/nginx/nginx.conf</code> ve varsayılan siteyi değiştirir.</li>
      </ul>
      <p>
        Başka servisler çalışan bir sunucu yerine Pushify&rsquo;a ayırdığınız bir sunucu bağlayın. Metrikler aynı SSH
        bağlantısı üzerinden okunur; agent veya telemetri kurulmaz.
      </p>
      <p>
        <strong>Bir sunucuyu Pushify&rsquo;dan kaldırmak şu an anahtarımızı silmiyor.</strong>{' '}
        <code>/root/.ssh/authorized_keys</code> dosyasından <code>pushify-&hellip;</code> ile biten satırı kendiniz
        silin. Otomatik silme listemizde.
      </p>

      <h2>6. Paylaşımlı sunucularda izolasyon</h2>
      <p>
        Birden fazla müşteriye hizmet veren sunucularda uygulamalar, container&rsquo;lar arası trafiği kapalı ayrı bir
        Docker ağında çalışır. Güvenlik duvarı kuralları bir uygulamadan diğerine, özel ve link-local ağlara ve host&rsquo;a
        giden trafiği keser; yalnızca host&rsquo;un 80 ve 443 portları açıktır. Domaini olan uygulamalara yalnızca nginx
        üzerinden erişilir.
      </p>

      <h2>7. AI asistanı</h2>
      <p>
        Paneldeki asistan Anthropic altyapısıyla çalışır. Yazdığınız mesajları ve bulunduğunuz panel sayfasının adını
        alır. Ortam değişkenlerinizi, loglarınızı veya kaynak kodunuzu otomatik olarak almaz. Yalnızca paylaşmakta
        rahat olduğunuz şeyleri yapıştırın.
      </p>
    </LegalPageLayout>
  );
}
