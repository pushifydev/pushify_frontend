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
        { id: 'buildSources', label: 'Özel imajlar ve compose' },
        { id: 'monitoring', label: 'İzleme ve uyarılar' },
      ],
    },
    {
      label: 'Entegrasyonlar',
      items: [
        { id: 'webhooks', label: 'Webhook ve CI/CD' },
        { id: 'sso', label: 'Tek oturum açma' },
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
      'Pushify\'da iki ücret vardır: (1) platform aboneliği — dağıtım/API/ekip limitleri; (2) altyapı kredileri — yönetilen Hetzner çalışırken saatlik düşen ön ödemeli USD cüzdan. BYOS (SSH) sunucuları cüzdanı kullanmaz. Bakiye ve yükleme: Panel → Faturalandırma. Kredi biterse sunucu durur. Platform ödemesi başarısızsa kart güncellenene kadar yeni kaynak oluşturulamaz.',
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
          provider: 'Bulut sağlayıcı (hetzner)',
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
  monitoring: {
    title: 'İzleme, loglar ve yedekler',
    description:
      'Pushify\'ın sizin adınıza neleri izlediği, e-posta gelip gelmeyeceğine karar veren eşikler ve topladıklarını ne kadar sakladığı.',
    alertsTitle: 'Ne zaman e-posta gelir',
    alertsText:
      'Canlı bir deploy\'u ve adresi olan her aktif proje dakikada bir aranır — ayar gerekmez. E-posta gönderen durumlar şunlar:',
    alerts: [
      {
        when: 'Uygulama cevap vermeyi bırakır',
        detail:
          'Üst üste üç başarısız kontrol; yani tek bir yeniden başlatma kesinti sayılmaz. Tekrar cevap verdiğinde ikinci bir e-posta gelir ve ne kadar süre erişilemediğini söyler. Tanımlı bir sağlık kontrolü yoksa herhangi bir cevap "ayakta" sayılır — / üzerindeki 404 eksik bir rotadır, çöken bir uygulama değil.',
      },
      {
        when: 'Bellek 5 dakika boyunca limitin %90\'ının üstünde',
        detail:
          'Bu noktadan sonra çekirdek neyi öldüreceğine karar veriyordur ve sonuç genelde bir yeniden başlatma döngüsüdür. Bu, uygulama cevap vermeyi bırakmadan önce gelen uyarıdır. Bellek limiti tanımlı değilse yok sayılır, çünkü yüzde tüm sunucunun olur.',
      },
      {
        when: 'CPU 15 dakika boyunca %90\'ın üstünde',
        detail:
          'Bellekten çok daha uzun, çünkü bir build ya da toplu iş CPU\'yu haklı olarak doldurur. Uygulama çökmüş değildir — istekler arkasında sıraya girmiştir.',
      },
      {
        when: 'Bir sunucunun diski uyarı seviyesini aşar',
        detail:
          'Sadece deploy sırasında değil, saatlik kontrol edilir. Dolu bir disk o kutudaki bütün container\'ları birlikte düşürür, veritabanları dahil. Dolu kaldıkça günde bir hatırlatma gelir.',
      },
      {
        when: 'Bir HTTPS sertifikasının süresi dolmak üzere',
        detail: 'On dört gün önce, sonra üç gün kala bir kez daha. Yenileme bir şey engellemedikçe otomatiktir — DNS taşınmış, 80 portu kapanmış olabilir.',
      },
    ],
    quietTitle: 'Neden e-posta yağmuruna tutulmazsınız',
    quietText:
      'Her container başlarken bir an %100 CPU\'ya çıkar, çöp toplayıcı tasarım gereği %95 bellekte çalışır. Bu yüzden bir okumanın sayılması için pencerenin tamamı boyunca çizginin üstünde kalması gerekir — ve ancak çizginin belirgin şekilde altına indiğinde temizlenir, yoksa eşikte gezinen bir değer sonsuza kadar "sorun" ve "düzeldi" gönderirdi. Çizgiyi aşan üç replika, üç e-posta değil, en kötü container\'ı söyleyen tek bir e-postadır.',
    recipientsTitle: 'Kime gider',
    recipientsText:
      'Kuruluştaki, kendi bildirim ayarlarında deploy uyarılarını açık bırakmış herkese. Projenin bildirim kanalları (Slack, Discord, webhook) da ayakta/çökük olaylarını alır.',
    logsTitle: 'Loglar ne kadar saklanır',
    logsText:
      'Container çıktısı, projenin çalıştırdığı her container\'dan toplanır — uygulama, replikaları, worker\'ları ve staging kopyası — ve terime, zaman aralığına ve container\'a göre aranabilir. Ne kadar kalacağı plana bağlıdır:',
    logRetention: [
      { plan: 'Free', kept: '3 gün' },
      { plan: 'Hobby', kept: '7 gün' },
      { plan: 'Pro', kept: '14 gün' },
      { plan: 'Business', kept: '30 gün' },
      { plan: 'Enterprise', kept: '90 gün' },
    ],
    scalingTitle: 'Yüke göre ölçekleme',
    scalingText:
      'Proje ayarları → Otomatik ölçekle ile bir alt ve üst sınır verirsiniz; Pushify container sayısını CPU değiştikçe bu aralıkta hareket ettirir. Pro ve üzeri planlarda. Kapalı bırakırsanız sayı tam olarak belirlediğiniz yerde kalır.',
    scalingNotes: [
      'Bir seferde tek container: %100 CPU okuması bir tane ekler, beş değil — container başlaması zaman alır ve okuma henüz bir tanenin yetip yetmeyeceğini bilemez.',
      'Ortalama CPU %70 üstündeyken eklenir ve üç dakika boyunca tekrar eklenmez. %30 altındayken kaldırılır ve on dakika boyunca tekrar kaldırılmaz — öğle saatindeki bir durgunluk, yoğun bir sabahı geri almamalı.',
      'Hiçbir şey olmadan önce en az üç okuma gerekir, yani tek bir ani yükselme hiçbir şeyi değiştirmez.',
      'Alt ya da üst sınırı değiştirmek anında uygulanır; eşik ya da bekleme süresi beklenmez. Aralık bir talimattır, eşikler bir tahmindir.',
      'Yeni container, son deploy\'un gerçekte kullandığı ayarlarla başlatılır; böylece hâlihazırda çalışanlardan farklı olamaz. Otomatik ölçekleme eklenmeden önce deploy edilmiş bir proje, bir sonraki deploy\'undan sonra ölçeklenmeye başlar.',
      'Küçülürken container önce nginx\'ten çıkarılır ve reload edilir, sonra durdurulur; böylece işlenmekte olan istekler tamamlanır.',
      'Her değişiklik, sebebi olan okumayla birlikte kaydedilir ve proje ayarlarında listelenir.',
      'Eşiklerin uygulamanıza uyup uymadığından emin değil misiniz? "Sadece ne yapacağını bildir" seçeneğini açın: karar yine verilir ve kaydedilir ama hiçbir şey değişmez. Birkaç gün izleyip karar verin.',
    ],
    backupsTitle: 'Yedekler ve aralığın bedeli',
    backupsText:
      'Yönetilen bir veritabanı otomatik yedeklenir. Seçtiğiniz aralık, en kötü senaryoda kaybedeceğiniz veridir: 24 saatte, diski kaybetmek bir günlük yazma demektir. En kısa aralığı planınız belirler — Free\'de günlük, Hobby\'de 12 saat, Pro\'da 6 saat, Business ve Enterprise\'da saatlik.',
    backupNotes: [
      'Hiç yedeklenmemiş bir veritabanı, ilk aralığın dolmasını beklemeden hemen yedeklenir.',
      'Operatör dış depolama tanımladıysa her dump alındığı sunucunun dışına da kopyalanır — ve geri yükleme bu kopyaya düşer, yani veritabanı dosyayı hiç görmemiş bir sunucuya geri yüklenebilir.',
      'Yedek listesi her yedek için dış kopyanın olup olmadığını gösterir.',
      'Bir veritabanını silmek yedeklerini de siler, dış kopyalar dahil.',
    ],
  },
  buildSources: {
    title: 'Özel imajlar ve compose yığınları',
    description:
      'Bir proje depoyu build edebilir, hazır bir imajı çalıştırabilir ya da bütün bir compose yığınını ayağa kaldırabilir. Her birinin gerektirdiği kimlik bilgileri ve registry\'lerin gerçekten istediği izinler burada.',
    registriesTitle: 'Özel registry\'ler',
    registriesText:
      'Ayarlar → Özel registry\'ler, tüm kuruluş için registry başına tek bir giriş saklar. İki şey için kullanılır: FROM satırı özel bir base imaj olan Dockerfile\'lar ve hazır imaj deploy eden projeler. Token yalnızca yazılır — bir kez gönderilir, bir daha gösterilmez, sadece değiştirilebilir.',
    registries: [
      {
        name: 'GitHub Container Registry',
        host: 'ghcr.io',
        steps: [
          'GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).',
          'read:packages izniyle bir token üretin. Çekmek için bu tek izin yeterlidir; repo ve write:packages gerekmez.',
          'Kullanıcı adı GitHub kullanıcı adınız, parola ise token.',
        ],
      },
      {
        name: 'Docker Hub',
        host: 'docker.io',
        steps: [
          'Docker Hub → Account Settings → Personal access tokens → Generate.',
          'Read-only erişim verin.',
          'Kullanıcı adı Docker Hub kullanıcı adınız, parola ise token — hesap parolanız değil.',
        ],
      },
      {
        name: 'GitLab Container Registry',
        host: 'registry.gitlab.com',
        steps: [
          'GitLab projesi → Settings → Repository → Deploy tokens.',
          'read_registry izniyle bir tane oluşturun.',
          'GitLab\'in gösterdiği token kullanıcı adını ve değerini olduğu gibi kullanın.',
        ],
      },
    ],
    registryScopeTitle: 'Sadece okuma yetkisi yeterli',
    registryScopeText:
      'Pushify yalnızca çeker. Yazma yetkisi de olan bir token, sızması hâlinde imajlarınızın değiştirilebileceği anlamına gelir; okuma yetkisi verin, fazlasını değil.',
    imageTitle: 'Hazır bir imajı deploy etmek',
    imageText:
      'Proje ayarları → Docker imajı: bir referans girin, proje depoyu build etmek yerine o imajı deploy etsin. Her deploy referansı yeniden çeker, yani etiketi taşıyıp deploy almak yeni imajı yayınlar.',
    imageExample: 'ghcr.io/acme/api:1.4',
    imageNotes: [
      'İmaj kendi tanımlarını korur — CMD, ENV ve açtığı port olduğu gibi kullanılır.',
      'Build edilen bir uygulamayla aynı muameleyi görür: blue-green geçiş, replikalar, staging, volume\'ler, alan adları ve HTTPS.',
      'Alanın altındaki depo ayarları geçerliliğini yitirir; arayüz bunu söyler.',
      'Özel bir imaj için o host\'a ait bir registry kimlik bilgisi gerekir — yukarıya bakın.',
      'Bunun için bir sunucu gerekir; sunucusuz mod imaj çekemez.',
    ],
    composeTitle: 'Bir compose yığınını deploy etmek',
    composeText:
      'Proje ayarları → Docker Compose dosyası: deponuzdaki bir compose dosyasının yolunu verin, proje checkout\'unuzdan bir yığın olarak deploy edilsin. Böylece build: bağlamları ve yanındaki config dosyaları yerelde olduğu gibi çalışır. Varsayılan kapalıdır ve kendiliğinden kullanılmaz — çoğu depoda yerel geliştirme için bir compose dosyası vardır, onu deploy etmek sürpriz olurdu.',
    composeExample: `services:
  web:
    build: ./web
    ports:
      - "8080:3000"
    environment:
      API: http://api:4000
  api:
    build: ./api`,
    composeNotes: [
      'Servisler yığın ağında birbirine adıyla erişir, tıpkı yereldeki gibi.',
      'Birden fazla servis port yayınlıyorsa ayarlarda hangisinin servis edileceğini belirtin — aksi hâlde tahmin edilmez, deploy reddedilir.',
      'Projenin ortam değişkenleri yığına verilir; depoda commit\'lenmiş bir .env varsa önce o okunur.',
      'Pushify\'ın Worker ve Zamanlanmış görevleri tek bir container\'ı sürer, burada geçerli değildir — onları compose dosyasında servis olarak tanımlayın. Deploy log\'u bunu sessizce geçmek yerine söyler.',
      'Yeniden deploy yığını indirip kaldırır, yani build edilen bir uygulamanın aksine kesintisiz değildir.',
    ],
    composePortsTitle: 'Portlara sizin yerinize karar verilir',
    composePortsText:
      'Yalnızca servis edilen servis yayınlanır, nginx\'in proxy\'lediği portta. Diğer servislerin ports: satırları düşürülür — veritabanı için 5432:5432 yazan bir dosya, aksi hâlde o veritabanını doğrudan internete açardı. Yığının içinde hiçbir şey değişmez.',
  },
  sso: {
    title: 'Tek oturum açma (OIDC)',
    description:
      'Ekibinizin kendi kimlik sağlayıcınız üzerinden giriş yapmasını sağlayın. Yanlış yapılması kolay olan kısımların hepsi sağlayıcı tarafında, o yüzden burada orada ne gireceğiniz anlatılıyor.',
    beforeTitle: 'Başlamadan önce',
    beforeText:
      'Kuruluşun sahibi olmanız gerekiyor. Ayarlar → Tek oturum açma ekranını açın: sağlayıcınızın kullanıcıları geri göndereceği yönlendirme adresini gösterir. Şimdi kopyalayın — her sağlayıcı önce onu ister.',
    redirectExample: 'https://api.pushify.dev/api/v1/sso/callback',
    redirectWarningTitle: 'Yönlendirme adresi birebir aynı olmalı',
    redirectWarning:
      'Harfi harfine — https dahil, sonundaki yol dahil. En sık yapılan hata budur ve girişin en sonunda, Pushify\'dan değil sağlayıcıdan gelen bir hata olarak ortaya çıkar; yani bir ayar sorunu değil de onların sorunu gibi görünür.',
    issuerLabel: 'Pushify\'a girilecek issuer',
    providers: [
      {
        name: 'Okta',
        steps: [
          'Okta yönetim konsolunda Applications → Create App Integration.',
          'OIDC – OpenID Connect, ardından Web Application seçin.',
          'Sign-in redirect URIs alanına Pushify\'daki adresi yapıştırın.',
          'Assignments altında kimlerin kullanabileceğini seçin — yalnızca onlar giriş yapabilir.',
          'Kaydedin, General sekmesinden Client ID ve Client secret değerlerini kopyalayın.',
        ],
        issuer: 'https://KURULUSUNUZ.okta.com',
      },
      {
        name: 'Microsoft Entra ID (Azure AD)',
        steps: [
          'Azure portalında Microsoft Entra ID → App registrations → New registration.',
          'Redirect URI için Web seçin ve Pushify\'daki adresi yapıştırın.',
          'Kayıttan sonra Application (client) ID ve Directory (tenant) ID değerlerini not edin.',
          'Certificates & secrets → New client secret ile bir gizli anahtar oluşturun ve Value sütununu kopyalayın (ID\'yi değil — Value yalnızca bir kez gösterilir).',
          'Token configuration altında email isteğe bağlı talebini ekleyin; Microsoft Graph email izni için kutu çıkarsa işaretleyin.',
        ],
        issuer: 'https://login.microsoftonline.com/TENANT-ID/v2.0',
      },
      {
        name: 'Google Workspace',
        steps: [
          'Google Cloud Console\'da kuruluşunuzun projesini seçip APIs & Services → Credentials bölümünü açın.',
          'Create Credentials → OAuth client ID → Web application.',
          'Authorised redirect URIs alanına Pushify\'daki adresi yapıştırın.',
          'Client ID ve Client secret değerlerini kopyalayın.',
          'OAuth consent screen\'de User type değerini Internal yapın; böylece yalnızca Workspace hesaplarınız kullanabilir.',
        ],
        issuer: 'https://accounts.google.com',
      },
    ],
    finishTitle: 'Pushify tarafında tamamlama',
    finishSteps: [
      'Ayarlar → Tek oturum açma: issuer, client ID ve client secret girin.',
      'Kuruluşunuza ait e-posta alan adlarını ekleyin — yalnızca bu alanlardaki adresler sağlayıcı üzerinden girer. gmail.com gibi genel sağlayıcılar reddedilir, çünkü herkeste olabilir.',
      'Sağlayıcı birini ilk kez gönderdiğinde alacağı rolü seçin.',
      'Kaydedin. Pushify kaydetmeden önce sağlayıcıya bağlanır, yani yanlış bir issuer ilk giriş yapmaya çalışan kişi tarafından değil burada fark edilir.',
      'Çıkış yapıp giriş ekranına o alan adlarından bir adres yazın — parola alanının yerini tek bir düğme alır.',
    ],
    enforceTitle: 'SSO\'yu zorunlu kılmak',
    enforceText:
      '"Tek oturum açmayı zorunlu kıl" açıkken o alan adları için parola, GitHub ve Google girişi tamamen kapanır. Zaten amacı budur: birini kimlik sağlayıcınızda kapatmak, Pushify erişimini kesmeye yeter. İki adımlı doğrulama üstüne yine uygulanır — SSO kimin kim olduğunu söyler, istediğiniz ikinci faktörü kaldırmaz.',
    lockoutTitle: 'Zorunlu kılmadan önce deneyin',
    lockoutText:
      'Parolalar hâlâ çalışırken sağlayıcı üzerinden bir kez giriş yapın. Bağlantı hatalıysa ve zorunluluğu çoktan açtıysanız sahip hesabı da dışarıda kalır; bunu düzeltmek sunucuya erişim gerektirir.',
    troubleTitle: 'Çalışmadığında',
    troubles: [
      {
        problem: 'Sağlayıcı yönlendirme adresinin eşleşmediğini söylüyor',
        fix: 'Ayarlar → Tek oturum açma ekranından tekrar kopyalayın. Adres API adresinizden türetilir, o değişirse bu da değişir.',
      },
      {
        problem: '"kimlik sağlayıcıda doğrulanmamış"',
        fix: 'Sağlayıcı, doğrulamadığı bir adres gönderdi. Entra\'da email isteğe bağlı talebini ekleyin; Okta\'da kullanıcının doğrulanmış bir birincil e-postası olduğundan emin olun.',
      },
      {
        problem: '"bu bağlantının giriş yaptırdığı bir alan adında değil"',
        fix: 'Adres gerçek ama alan adı listenizde yok. Ekleyin ya da kişi iş adresini kullansın. Alt alan adları sayılmaz: @eu.acme.com, @acme.com değildir.',
      },
      {
        problem: 'Giriş doğrulanamadı',
        fix: 'Token imza ya da talep kontrolünden geçemedi. Genelde client secret yanlış ya da süresi dolmuştur — Entra gizli anahtarları genelde altı ayda sona erer.',
      },
      {
        problem: 'Herkes dışarıda kaldı',
        fix: 'Sunucuda kuruluşunuza ait satırı sso_connections tablosundan silin; parola girişi anında geri gelir.',
      },
    ],
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
