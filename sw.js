// 智医伴侣 Service Worker v1.0
// 支持离线功能和缓存管理

const CACHE_NAME = 'zhiyi-banlu-v1.0.0';
const STATIC_CACHE = 'zhiyi-static-v1.0.0';
const DYNAMIC_CACHE = 'zhiyi-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/manifest.json',
    // 图标文件
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    // 字体文件（如果有）
    // '/assets/fonts/custom-font.woff2',
];

// 需要网络优先的资源（API调用等）
const NETWORK_FIRST_URLS = [
    '/api/',
    '/analytics/',
];

// 需要缓存优先的资源
const CACHE_FIRST_URLS = [
    '/assets/',
    'https://cdnjs.cloudflare.com/',
];

// Service Worker 安装事件
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: 安装中...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Service Worker: 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: 安装完成');
                return self.skipWaiting(); // 立即激活新的 SW
            })
            .catch(error => {
                console.error('❌ Service Worker: 安装失败', error);
            })
    );
});

// Service Worker 激活事件
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: 激活中...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // 删除旧版本的缓存
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: 删除旧缓存', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: 激活完成');
                return self.clients.claim(); // 立即控制所有页面
            })
            .catch(error => {
                console.error('❌ Service Worker: 激活失败', error);
            })
    );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 只处理 HTTP/HTTPS 请求
    if (!request.url.startsWith('http')) {
        return;
    }

    // 根据不同的URL模式采用不同的缓存策略
    if (isNetworkFirst(request.url)) {
        event.respondWith(networkFirst(request));
    } else if (isCacheFirst(request.url)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// 判断是否需要网络优先策略
function isNetworkFirst(url) {
    return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

// 判断是否需要缓存优先策略
function isCacheFirst(url) {
    return CACHE_FIRST_URLS.some(pattern => url.includes(pattern));
}

// 网络优先策略（适用于API调用）
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // 将成功的响应存入动态缓存
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 网络请求失败，尝试从缓存获取:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 如果是导航请求，返回离线页面
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }

        throw error;
    }
}

// 缓存优先策略（适用于静态资源）
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('📦 缓存和网络都失败:', request.url, error);
        throw error;
    }
}

// 过期时重新验证策略（适用于一般内容）
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // 异步更新缓存
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.log('🔄 后台更新失败:', request.url, error);
    });

    // 如果有缓存，立即返回；否则等待网络响应
    if (cachedResponse) {
        return cachedResponse;
    }

    return fetchPromise;
}

// 后台同步事件（当网络恢复时同步数据）
self.addEventListener('sync', event => {
    console.log('🔄 后台同步:', event.tag);

    if (event.tag === 'sync-health-data') {
        event.waitUntil(syncHealthData());
    }
});

// 同步健康数据
async function syncHealthData() {
    try {
        // 获取本地存储的待同步数据
        const pendingData = await getStoredData('pending_sync_data');

        if (pendingData && pendingData.length > 0) {
            console.log('📤 同步待上传数据:', pendingData.length, '条');

            for (const data of pendingData) {
                try {
                    await fetch('/api/sync', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // 同步成功，从待同步列表中移除
                    await removeFromPendingSync(data.id);
                } catch (error) {
                    console.error('📤 数据同步失败:', data.id, error);
                }
            }
        }
    } catch (error) {
        console.error('🔄 后台同步失败:', error);
    }
}

// 推送通知事件
self.addEventListener('push', event => {
    console.log('📱 收到推送通知');

    const options = {
        body: '您有新的健康提醒',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: '查看详情',
                icon: '/assets/icons/action-open.png'
            },
            {
                action: 'dismiss',
                title: '稍后提醒',
                icon: '/assets/icons/action-dismiss.png'
            }
        ]
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            options.body = payload.message || options.body;
            options.data = { ...options.data, ...payload };
        } catch (error) {
            console.error('📱 推送数据解析失败:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification('智医伴侣', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
    console.log('📱 通知被点击:', event.action);

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    } else if (event.action === 'dismiss') {
        // 设置稍后提醒
        console.log('⏰ 设置稍后提醒');
    } else {
        // 默认操作：打开应用
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 消息事件（与主线程通信）
self.addEventListener('message', event => {
    console.log('📨 收到消息:', event.data);

    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;

            case 'GET_CACHE_STATUS':
                getCacheStatus().then(status => {
                    event.ports[0].postMessage(status);
                });
                break;

            case 'CLEAR_CACHE':
                clearAllCaches().then(result => {
                    event.ports[0].postMessage(result);
                });
                break;

            case 'SYNC_DATA':
                syncHealthData();
                break;

            default:
                console.log('📨 未知消息类型:', event.data.type);
        }
    }
});

// 获取缓存状态
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const cacheSize = await Promise.all(
            cacheNames.map(async name => {
                const cache = await caches.open(name);
                const keys = await cache.keys();
                return { name, count: keys.length };
            })
        );

        return {
            success: true,
            caches: cacheSize,
            totalCaches: cacheNames.length
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 清除所有缓存
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );

        return {
            success: true,
            message: `已清除 ${cacheNames.length} 个缓存`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 工具函数：获取存储数据
async function getStoredData(key) {
    // 这里模拟从 IndexedDB 或其他存储中获取数据
    // 实际实现需要根据具体的存储方案
    return [];
}

// 工具函数：从待同步列表移除数据
async function removeFromPendingSync(dataId) {
    // 这里模拟从待同步列表中移除数据
    console.log('✅ 已移除待同步数据:', dataId);
}

// 错误处理
self.addEventListener('error', event => {
    console.error('❌ Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Service Worker 未处理的Promise错误:', event.reason);
});

console.log('🏥 智医伴侣 Service Worker 已加载完成');