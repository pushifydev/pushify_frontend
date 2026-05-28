import type { DocsContent } from './types';

export const docsTr: DocsContent = {
  shell: {
    title: 'API Dokümantasyonu',
    searchPlaceholder: 'Ara...',
    navigation: 'Gezinti',
    dashboard: 'Kontrol Paneli',
    getApiKey: 'API Anahtarı Al',
    apiVersion: 'API v1.0',
  },
  labels: {
    parameters: 'Parametreler',
    paramName: 'Ad',
    paramType: 'Tür',
    paramDesc: 'Açıklama',
    request: 'İstek',
    response: 'Yanıt',
    copyCode: 'Kodu kopyala',
    baseUrl: 'Temel URL',
    headerFormat: 'Başlık Formatı',
    exampleRequest: 'Örnek İstek',
    availableScopes: 'Mevcut Kapsamlar',
    scopesIntro: 'Anahtar oluştururken belirli kapsamları seçerek API anahtarı erişimini sınırlayın.',
    explore: 'Keşfet',
    quickStart: 'Hızlı Başlangıç',
    code: 'Kod',
    description: 'Açıklama',
    plan: 'Plan',
    rateLimit: 'Hız Limiti',
  },
  navGroups: [
    {
      label: 'Başlangıç',
      items: [
        { id: 'intro', label: 'Giriş' },
        { id: 'auth', label: 'Kimlik Doğrulama' },
      ],
    },
    {
      label: 'API Referansı',
      items: [
        { id: 'projects', label: 'Projeler' },
        { id: 'deployments', label: 'Dağıtımlar' },
        { id: 'envvars', label: 'Ortam Değişkenleri' },
        { id: 'domains', label: 'Alan Adları' },
      ],
    },
    {
      label: 'Altyapı',
      items: [
        { id: 'servers', label: 'Sunucular' },
        { id: 'databases', label: 'Veritabanları' },
      ],
    },
    {
      label: 'Entegrasyonlar',
      items: [
        { id: 'webhooks', label: 'Webhook ve CI/CD' },
      ],
    },
    {
      label: 'Referans',
      items: [
        { id: 'errors', label: 'Hata Yönetimi' },
      ],
    },
  ],
  intro: {
    badge: 'REST API',
    title: 'Pushify API Dokümantasyonu',
    lead: 'Uygulamalarınızı programatik olarak dağıtın, yönetin ve izleyin. CI/CD hatları, otomasyon betikleri ve özel entegrasyonlar için idealdir.',
    idNote:
      'Yol ve yanıtlardaki kaynak kimlikleri UUID biçimindedir (örn. 550e8400-e29b-41d4-a716-446655440000). Listeleme veya oluşturma uç noktalarının döndürdüğü id değerini kullanın — proj_abc123 gibi örnek değerler geçerli değildir.',
    infraNoteTitle: 'Yönetilen sunucu faturalandırması',
    infraNote:
      'Yönetilen Hetzner sunucuları, platform aboneliğinden ayrı ön ödemeli altyapı kredileri ile faturalandırılır. Panel → Faturalandırma üzerinden kredi yükleyin.',
    features: [
      { title: 'RESTful API', desc: 'JSON yanıtlı basit REST uç noktaları' },
      { title: 'Güvenli', desc: 'Kapsam tabanlı API anahtarı izinleri' },
      { title: 'CI/CD Hazır', desc: 'Webhook tetikleyicileri ve dağıtım API\'si' },
    ],
    steps: [
      {
        title: 'API Anahtarı Oluşturun',
        desc: '',
        descBefore: 'Gerekli kapsamlarla bir anahtar oluşturmak için ',
        linkText: 'Ayarlar → API Anahtarları',
        descAfter: ' bölümüne gidin.',
      },
      {
        title: 'İstek Gönderin',
        desc: 'Kimlik doğrulama için API anahtarınızı Authorization başlığında kullanın.',
      },
      {
        title: 'Otomatikleştirin',
        desc: 'GitHub Actions, GitLab CI veya herhangi bir CI/CD aracıyla entegre edin.',
      },
    ],
    exploreLinks: [
      { label: 'Projeler API', desc: 'Projelerinizi yönetin' },
      { label: 'Dağıtımlar API', desc: 'Dağıtımları tetikleyin ve yönetin' },
      { label: 'Sunucular API', desc: 'Altyapıyı yönetin' },
      { label: 'Veritabanları API', desc: 'Veritabanlarını ve yedeklemeleri yönetin' },
    ],
  },
  auth: {
    title: 'Kimlik Doğrulama',
    description: 'Tüm API istekleri bir API anahtarı gerektirir. Bearer token olarak Authorization başlığına ekleyin.',
    securityTitle: 'Güvenlik',
    securityText: 'API anahtarlarını istemci tarafı kodda veya herkese açık depolarda asla paylaşmayın. Ortam değişkenlerinde saklayın.',
    sessionOnlyTitle: 'Yalnızca panel oturumu',
    sessionOnlyText:
      'Bazı uç noktalar API anahtarı yerine giriş yapılmış panel oturumu (JWT) gerektirir — örneğin GET /servers/:id/ssh-key ve POST /servers/:id/terminal. API anahtarları bu uç noktalarda 403 döner.',
    scopes: [
      { scope: 'projects:read', desc: 'Projeleri listele ve görüntüle' },
      { scope: 'projects:write', desc: 'Proje oluştur, güncelle, sil' },
      { scope: 'deployments:read', desc: 'Dağıtımları ve günlükleri görüntüle' },
      { scope: 'deployments:write', desc: 'Dağıtım tetikle, yeniden dağıt, geri al' },
      { scope: 'deployments:cancel', desc: 'Bekleyen veya çalışan dağıtımları iptal et' },
      { scope: 'logs:read', desc: 'Dağıtım derleme ve çalışma zamanı günlüklerini oku' },
      { scope: 'envvars:read', desc: 'Ortam değişkenlerini görüntüle' },
      { scope: 'envvars:write', desc: 'Ortam değişkenlerini yönet' },
      { scope: 'servers:read', desc: 'Sunucuları görüntüle' },
      { scope: 'servers:write', desc: 'Sunucuları yönet' },
      { scope: 'databases:read', desc: 'Veritabanlarını görüntüle' },
      { scope: 'databases:write', desc: 'Veritabanlarını yönet' },
      { scope: 'domains:read', desc: 'Alan adlarını görüntüle' },
      { scope: 'domains:write', desc: 'Alan adlarını yönet' },
    ],
  },
  projects: {
    title: 'Projeler',
    description: 'Projelerinizi programatik olarak yönetin. Proje oluşturun, güncelleyin, yapılandırın ve silin.',
    endpoints: {
      list: {
        description: 'Organizasyonunuzdaki tüm projeleri listeler.',
      },
      get: {
        description: 'Derleme yapılandırması ve alan adları dahil belirli bir proje hakkında ayrıntılı bilgi alır.',
      },
      create: {
        description: 'Yeni bir proje oluşturur. Git alanları Git olmadan dağıtım için isteğe bağlıdır.',
        params: {
          name: 'Proje adı',
          gitRepoUrl: 'Git deposu URL\'si (isteğe bağlı)',
          gitBranch: 'Dağıtılacak dal (varsayılan: main)',
          buildCommand: 'Derleme komutu (örn. npm run build)',
          startCommand: 'Başlatma komutu (örn. npm start)',
          port: 'Uygulama portu (varsayılan: 3000)',
        },
        responseMsg: 'Proje başarıyla oluşturuldu',
      },
      update: {
        description: 'Proje yapılandırmasını günceller. Yalnızca değiştirmek istediğiniz alanları ekleyin.',
        responseMsg: 'Proje başarıyla güncellendi',
      },
      remove: {
        description: 'Bir projeyi ve ilişkili tüm kaynakları siler.',
        responseMsg: 'Proje başarıyla silindi',
      },
      webhook: {
        description: 'Bu proje için GitHub webhook URL\'sini ve imza gizli anahtarının yapılandırılıp yapılandırılmadığını döndürür.',
        responseMsg: 'Webhook bilgisi alındı',
      },
    },
  },
  deployments: {
    title: 'Dağıtımlar',
    description: 'Dağıtımları tetikleyin ve yönetin. Derleme ilerlemesini izleyin, günlükleri görüntüleyin ve gerektiğinde geri alın.',
    endpoints: {
      list: {
        description: 'Bir proje için tüm dağıtımları en yeniden eskiye sıralı listeler.',
        params: {
          limit: 'Sayfa başına sonuç (varsayılan: 20)',
          offset: 'Sayfalama ofseti',
        },
      },
      create: {
        description: 'Bir proje için yeni bir dağıtım tetikler.',
        params: {
          branch: 'Dağıtılacak dal',
          commitHash: 'Dağıtılacak belirli commit',
          commitMessage: 'Referans için commit mesajı',
        },
        responseMsg: 'Dağıtım başarıyla oluşturuldu',
      },
      cancel: {
        description: 'Bekleyen veya derlenmekte olan bir dağıtımı iptal eder. deployments:write veya deployments:cancel kapsamı gerekir.',
        responseMsg: 'Dağıtım iptal edildi',
      },
      redeploy: {
        description: 'Önceki bir dağıtımla aynı yapılandırmayla yeni bir dağıtım oluşturur.',
        responseMsg: 'Yeniden dağıtım başlatıldı',
      },
      rollback: {
        description: 'Önceki başarılı bir dağıtıma geri döner.',
        responseMsg: 'Geri alma başlatıldı',
      },
      logs: {
        description: 'Bir dağıtım için derleme veya çalışma zamanı günlüklerini alır. deployments:read veya logs:read kapsamı gerekir.',
        params: {
          type: 'Günlük türü: "build" veya "deploy" (isteğe bağlı, varsayılan: build)',
        },
      },
    },
  },
  envvars: {
    title: 'Ortam Değişkenleri',
    description: 'Projeleriniz için ortam değişkenlerini yönetin. Değişiklikler bir sonraki dağıtımda geçerli olur.',
    sensitiveTitle: 'Hassas Değerler',
    sensitiveText: 'Ortam değişkeni değerleri depolamada şifrelenir ve API yanıtlarında maskelenir. Yalnızca ilk ve son karakterler görünür.',
    endpoints: {
      list: {
        description: 'Bir proje için tüm ortam değişkenlerini listeler. Güvenlik için değerler maskelenir.',
        params: {
          environment: 'Ortama göre filtre: production veya preview (isteğe bağlı)',
        },
      },
      create: {
        description: 'Yeni bir ortam değişkeni oluşturur.',
        params: {
          key: 'Değişken adı (örn. DATABASE_URL)',
          value: 'Değişken değeri',
          isSecret: 'Gizli olarak işaretle (varsayılan: true)',
          environment: 'Hedef ortam: production veya preview (isteğe bağlı, varsayılan: production)',
        },
        responseMsg: 'Ortam değişkeni oluşturuldu',
      },
      bulk: {
        description: 'Birden fazla ortam değişkenini aynı anda oluşturur veya günceller. .env dosyalarını senkronize etmek için kullanışlıdır.',
        params: {
          variables: '{ key, value, isSecret } nesnelerinden oluşan dizi',
        },
        responseMsg: 'Ortam değişkenleri güncellendi',
      },
      update: {
        description: 'Mevcut bir ortam değişkeninin anahtarını veya değerini günceller.',
        responseMsg: 'Ortam değişkeni güncellendi',
      },
      remove: {
        description: 'Bir ortam değişkenini siler.',
        responseMsg: 'Ortam değişkeni silindi',
      },
    },
  },
  domains: {
    title: 'Alan Adları',
    description: 'Projelerinize özel alan adları ekleyin. DNS ayarlarını, SSL sertifikalarını ve Nginx yapılandırmasını yönetin.',
    endpoints: {
      list: {
        description: 'Bir proje için yapılandırılmış tüm alan adlarını listeler.',
      },
      create: {
        description: 'Bir projeye özel alan adı ekler. Yapılandırılacak DNS kayıtlarını döndürür.',
        params: {
          domain: 'Alan adı (örn. myapp.com)',
        },
        responseMsg: 'Alan adı eklendi. Doğrulamak için DNS kayıtlarını yapılandırın.',
      },
      verify: {
        description: 'Alan adı DNS yapılandırmasını doğrular ve SSL sertifikası sağlar.',
        responseMsg: 'Alan adı başarıyla doğrulandı',
      },
      primary: {
        description: 'Bir alan adını proje için birincil alan adı olarak ayarlar.',
        responseMsg: 'Birincil alan adı güncellendi',
      },
      remove: {
        description: 'Bir alan adını projeden kaldırır.',
        responseMsg: 'Alan adı kaldırıldı',
      },
    },
  },
  servers: {
    title: 'Sunucular',
    description: 'Sunucuları sağlayın ve yönetin. Bulut sunucuları oluşturun, durumlarını kontrol edin ve izleyin.',
    sessionOnlyTitle: 'API anahtarı ile kullanılamaz',
    sessionOnlyText:
      'SSH özel anahtarları (GET /servers/:id/ssh-key) ve tarayıcı web terminali (POST /servers/:id/terminal) yalnızca aktif panel oturumu ile kullanılabilir.',
    endpoints: {
      list: {
        description: 'Organizasyonunuzdaki tüm sunucuları listeler.',
      },
      create: {
        description: 'Yeni bir sunucu oluşturur ve sağlar.',
        params: {
          name: 'Sunucu adı',
          provider: 'Bulut sağlayıcı (hetzner, digitalocean)',
          region: 'Bölge tanımlayıcısı',
          size: 'Sunucu boyutu/türü',
        },
        responseMsg: 'Sunucu sağlanıyor',
      },
      get: {
        description: 'Özellikler ve durum dahil ayrıntılı sunucu bilgisi alır.',
      },
      start: {
        description: 'Durdurulmuş bir sunucuyu başlatır.',
        responseMsg: 'Sunucu başlatılıyor',
      },
      stop: {
        description: 'Çalışan bir sunucuyu durdurur. Sunucudaki tüm konteynerler durdurulur.',
        responseMsg: 'Sunucu durduruluyor',
      },
      reboot: {
        description: 'Bir sunucuyu yeniden başlatır. Yeniden başlatma sırasında kısa süreli kesinti beklenir.',
        responseMsg: 'Sunucu yeniden başlatılıyor',
      },
      remove: {
        description: 'Bir sunucuyu siler. Bu kalıcıdır ve sunucudaki tüm verileri yok eder.',
        responseMsg: 'Sunucu silindi',
      },
    },
  },
  databases: {
    title: 'Veritabanları',
    description: 'Sunucularınızda veritabanları oluşturun ve yönetin. PostgreSQL, MySQL, Redis ve MongoDB desteklenir.',
    endpoints: {
      list: {
        description: 'Organizasyonunuzdaki tüm veritabanlarını listeler.',
      },
      create: {
        description: 'Bir sunucuda yeni bir veritabanı oluşturur.',
        params: {
          name: 'Veritabanı adı',
          type: 'postgresql, mysql, redis, mongodb',
          serverId: 'Veritabanının oluşturulacağı sunucu',
          description: 'İsteğe bağlı açıklama',
        },
        responseMsg: 'Veritabanı oluşturuluyor',
      },
      credentials: {
        description: 'Ana bilgisayar, port, kullanıcı adı, parola ve bağlantı dizesi dahil veritabanı bağlantı kimlik bilgilerini alır.',
      },
      connect: {
        description: 'Bir veritabanını bir projeye bağlar. Bağlantı kimlik bilgilerini ortam değişkenleri olarak enjekte eder.',
        params: {
          projectId: 'Bağlanılacak proje',
          envPrefix: 'Ortam değişkeni öneki (varsayılan: DATABASE)',
        },
        responseMsg: 'Veritabanı projeye bağlandı',
      },
      start: {
        description: 'Durdurulmuş bir veritabanını başlatır.',
        responseMsg: 'Veritabanı başlatılıyor',
      },
      stop: {
        description: 'Çalışan bir veritabanını durdurur.',
        responseMsg: 'Veritabanı durduruluyor',
      },
      backup: {
        description: 'Veritabanının manuel bir yedeğini oluşturur.',
        responseMsg: 'Yedekleme başlatıldı',
      },
      restore: {
        description: 'Bir veritabanını yedekten geri yükler. Uyarı: bu mevcut veritabanının üzerine yazar.',
        responseMsg: 'Geri yükleme başlatıldı',
      },
      remove: {
        description: 'Bir veritabanını ve tüm verilerini kalıcı olarak siler.',
        responseMsg: 'Veritabanı silindi',
      },
    },
  },
  webhooks: {
    title: 'Webhook ve CI/CD',
    description: 'GitHub\'a push yaptığınızda otomatik olarak dağıtın. Pushify webhook olaylarını dinler ve dağıtımları tetikler.',
    howItWorks: 'Nasıl Çalışır',
    steps: [
      { title: 'GitHub Bağlayın', desc: 'Proje ayarlarından GitHub hesabınızı bağlayın.' },
      { title: 'Dala Push Yapın', desc: 'Yapılandırılmış dala kod push edin (örn. main).' },
      { title: 'Otomatik Dağıtım', desc: 'Pushify webhook\'u alır ve otomatik olarak bir dağıtım başlatır.' },
    ],
    manualTitle: 'Manuel Webhook URL\'si',
    manualDesc: 'Her projenin diğer Git sağlayıcılarıyla manuel entegrasyon için benzersiz bir webhook URL\'si vardır.',
    githubTitle: 'GitHub Actions Örneği',
    githubDesc: 'Dağıtımlar API\'sini kullanarak dağıtımları doğrudan GitHub Actions\'tan tetikleyin.',
    secretTitle: 'Webhook Gizli Anahtarı',
    secretText:
      'Webhook yükleri HMAC-SHA256 ile imzalanır. Webhook gizli anahtarınızı proje ayarlarından veya GET /projects/:id/webhook uç noktasından alın.',
  },
  errors: {
    title: 'Hata Yönetimi',
    description: 'API standart HTTP durum kodlarını kullanır ve ayrıntılı hata mesajlarını JSON formatında döndürür.',
    httpStatusTitle: 'HTTP Durum Kodları',
    statusRows: [
      { code: '200', desc: 'Başarılı' },
      { code: '201', desc: 'Oluşturuldu - Kaynak başarıyla oluşturuldu' },
      { code: '400', desc: 'Hatalı İstek - Geçersiz parametreler' },
      { code: '401', desc: 'Yetkisiz - Geçersiz veya eksik API anahtarı' },
      { code: '403', desc: 'Yasak - Yetersiz izin / kapsam' },
      { code: '404', desc: 'Bulunamadı - Kaynak mevcut değil' },
      { code: '429', desc: 'Çok Fazla İstek - Hız limiti aşıldı' },
      { code: '500', desc: 'Dahili Sunucu Hatası' },
    ],
    responseFormatTitle: 'Hata Yanıt Formatı',
    commonCodesTitle: 'Yaygın Hata Kodları',
    errorCodes: [
      { code: 'UNAUTHORIZED', desc: 'API anahtarı eksik, geçersiz veya süresi dolmuş' },
      { code: 'INSUFFICIENT_SCOPE', desc: 'API anahtarı gerekli izinlere sahip değil' },
      { code: 'NOT_FOUND', desc: 'İstenen kaynak bulunamadı' },
      { code: 'VALIDATION_ERROR', desc: 'İstek gövdesi veya parametreler geçersiz' },
      { code: 'RATE_LIMITED', desc: 'Çok fazla istek, yavaşlayın' },
      { code: 'CONFLICT', desc: 'Kaynak zaten mevcut veya durum çakışması' },
    ],
    rateLimitsTitle: 'Hız Limitleri',
    rateLimitsIntro: 'API istekleri API anahtarı başına hız sınırlıdır. Limitler plana göre değişir.',
    rateLimitRows: [
      { plan: 'Free', limit: '60 istek/dk' },
      { plan: 'Hobby', limit: '120 istek/dk' },
      { plan: 'Pro', limit: '300 istek/dk' },
      { plan: 'Business', limit: '600 istek/dk' },
      { plan: 'Enterprise', limit: 'Sınırsız' },
    ],
    rateLimitFooter:
      'Hız limiti başlıkları her yanıtta dahil edilir: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    exampleTitle: 'Hata Yönetimi Örneği',
  },
};
