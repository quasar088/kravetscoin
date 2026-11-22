(function () {
    'use strict';

    // ——— Налаштування (змініть username свого бота) ———
    const CONFIG = {
        botUsername: 'KravetsCoin_bot',
        referralBonus: 500,
        newUserBonus: 250,
        energyRegenPerSec: 1,
        boostMultiplier: 2,
        boostDurationMs: 30000,
        boostUnlockLevel: 3,
        maxClicksPer100ms: 8,
    };

    const LEVELS = [
        { level: 1, xpRequired: 0, rank: 'Новачок' },
        { level: 2, xpRequired: 1000, rank: 'Тапер' },
        { level: 3, xpRequired: 3500, rank: 'Фармер' },
        { level: 4, xpRequired: 8000, rank: 'Майнер' },
        { level: 5, xpRequired: 15000, rank: 'Кит' },
        { level: 6, xpRequired: 30000, rank: 'Бос' },
        { level: 7, xpRequired: 60000, rank: 'Легенда' },
        { level: 8, xpRequired: 120000, rank: 'Імператор Vanya' },
    ];

    const UPGRADES = [
        {
            id: 'tap',
            name: 'Сила тапу',
            desc: '+1 монета за клік',
            icon: '👆',
            baseCost: 50,
            costMult: 1.55,
            maxLevel: 50,
        },
        {
            id: 'auto',
            name: 'Авто-майнер',
            desc: '+1 монета/сек пасивно',
            icon: '⚙️',
            baseCost: 200,
            costMult: 1.7,
            maxLevel: 30,
        },
        {
            id: 'energy',
            name: 'Макс. енергія',
            desc: '+100 до ліміту енергії',
            icon: '⚡',
            baseCost: 150,
            costMult: 1.45,
            maxLevel: 20,
        },
        {
            id: 'crit',
            name: 'Критичний тап',
            desc: '+2% шанс x3 винагороди',
            icon: '💥',
            baseCost: 300,
            costMult: 1.65,
            maxLevel: 25,
        },
        {
            id: 'regen',
            name: 'Реген енергії',
            desc: '+0.5 відновлення/сек',
            icon: '🔋',
            baseCost: 250,
            costMult: 1.5,
            maxLevel: 15,
        },
    ];

    const TASKS = [
        {
            id: 'tap100',
            title: 'Перші 100 тапів',
            desc: 'Натисни монету 100 разів',
            reward: 200,
            xp: 100,
            check: (s) => s.totalTaps >= 100,
        },
        {
            id: 'tap1000',
            title: 'Тап-машина',
            desc: 'Зроби 1000 тапів',
            reward: 1500,
            xp: 500,
            check: (s) => s.totalTaps >= 1000,
        },
        {
            id: 'level3',
            title: 'Досягни рівня 3',
            desc: 'Прокачайся до рівня 3',
            reward: 800,
            xp: 300,
            check: (s) => s.level >= 3,
        },
        {
            id: 'level5',
            title: 'Досягни рівня 5',
            desc: 'Стань справжнім китом',
            reward: 3000,
            xp: 1000,
            check: (s) => s.level >= 5,
        },
        {
            id: 'buyUpgrade',
            title: 'Перша прокачка',
            desc: 'Купи будь-яке покращення',
            reward: 150,
            xp: 50,
            check: (s) => s.totalUpgrades >= 1,
        },
        {
            id: 'invite1',
            title: 'Запроси друга',
            desc: '1 друг за реферальним посиланням',
            reward: 500,
            xp: 200,
            check: (s) => s.referralCount >= 1,
        },
        {
            id: 'balance10k',
            title: '10 000 $VANYA',
            desc: 'Накопич 10 000 монет загалом',
            reward: 1000,
            xp: 400,
            check: (s) => s.totalEarned >= 10000,
        },
        {
            id: 'daily3',
            title: 'Відданий гравець',
            desc: 'Забери щоденний бонус 3 рази',
            reward: 600,
            xp: 250,
            check: (s) => s.dailyClaims >= 3,
        },
        {
            id: 'tap250',
            title: 'Розігрів завершено',
            desc: 'Зроби 250 тапів',
            reward: 350,
            xp: 120,
            check: (s) => s.totalTaps >= 250,
        },
        {
            id: 'tap5000',
            title: 'Легенда тапів',
            desc: 'Зроби 5 000 тапів за весь час',
            reward: 3500,
            xp: 900,
            check: (s) => s.totalTaps >= 5000,
        },
        {
            id: 'earn50000',
            title: 'Грошовий магнат',
            desc: 'Зароби загалом 50 000 $VANYA',
            reward: 5000,
            xp: 1200,
            check: (s) => s.totalEarned >= 50000,
        },
        {
            id: 'upgrade5',
            title: 'Інженер прокачки',
            desc: 'Купи 5 покращень',
            reward: 1200,
            xp: 350,
            check: (s) => s.totalUpgrades >= 5,
        },
        {
            id: 'upgrade20',
            title: 'Майстер апгрейдів',
            desc: 'Купи 20 покращень',
            reward: 4500,
            xp: 1000,
            check: (s) => s.totalUpgrades >= 20,
        },
        {
            id: 'crit25',
            title: 'Критична маса',
            desc: 'Отримай 25 критичних тапів',
            reward: 1800,
            xp: 500,
            check: (s) => s.criticalTaps >= 25,
        },
        {
            id: 'spend10000',
            title: 'Інвестор',
            desc: 'Витрать 10 000 монет на покращення та персонажів',
            reward: 2500,
            xp: 650,
            check: (s) => s.totalSpent >= 10000,
        },
        {
            id: 'combo25',
            title: 'Комбо-машина',
            desc: 'Досягни комбо x25',
            reward: 1000,
            xp: 300,
            check: (s) => s.bestCombo >= 25,
        },
        {
            id: 'level7',
            title: 'Майже імператор',
            desc: 'Досягни 7 рівня',
            reward: 7000,
            xp: 1600,
            check: (s) => s.level >= 7,
        },
        {
            id: 'skins3',
            title: 'Колекціонер',
            desc: 'Збери 3 персонажів',
            reward: 1500,
            xp: 400,
            check: (s) => s.ownedCharacters.length >= 3,
        },
    ];


    const EXPANSION_TASKS = [
        ['boss1','Перша перемога','Переможи першого боса',1,'bossesDefeated',1,1800,500],
        ['boss3','Мисливець на босів','Переможи 3 босів',3,'bossesDefeated',3,5000,1200],
        ['case1','Таємниці коробки','Відкрий перший кейс',1,'casesOpened',1,900,250],
        ['case10','Колекціонер сюрпризів','Відкрий 10 кейсів',10,'casesOpened',10,6500,1500],
        ['arcade3','Аркадний новачок','Зіграй у 3 мініігри',3,'miniGamesPlayed',3,1500,400],
        ['arcade10','Аркадний майстер','Зіграй у 10 мініігор',10,'miniGamesPlayed',10,6000,1400],
        ['reaction','Блискавична реакція','Покажи реакцію швидше 350 мс',1,'reaction350',1,2500,700],
        ['memory3','Пам’ять чемпіона','Виграй 3 memory-челенджі',3,'memoryWins',3,3000,800],
        ['guess3','Щасливчик','Вгадай число 3 рази',3,'guessWins',3,3000,800],
        ['wheel3','Колесо крутиться','Зроби 3 обертання колеса',3,'wheelPaidSpins',3,3500,900],
        ['contract1','Контракт виконано','Заверши 1 щоденний контракт',1,'contractsDone',1,2000,550],
        ['prestige1','Нове начало','Отримай перший престиж',1,'prestige',1,10000,2500],
        ['earn100k','Серйозний капітал','Зароби 100 000 монет',100000,'totalEarned',100000,9000,2000],
        ['tap10000','Десять тисяч тапів','Зроби 10 000 тапів',10000,'totalTaps',10000,8000,1800],
        ['boss5','Легенда арени','Переможи 5 босів',5,'bossesDefeated',5,12000,3000],
    ].map(([id,title,desc,target,key,threshold,reward,xp]) => ({
        id,title,desc,reward,xp,
        check: s => key === 'reaction350' ? (s.bestReaction > 0 && s.bestReaction <= 350)
            : key === 'contractsDone' ? s.contractsDone >= threshold : s[key] >= threshold
    }));
    TASKS.push(...EXPANSION_TASKS);

    const DAILY_REWARDS = [100, 200, 350, 500, 750, 1000, 2000];

    const DEFAULT_TAP_IMAGE = 'https://i.ibb.co/NFMdyzb/Ivan-coin-button.png';

    const RARITY_LABELS = {
        common: 'Звичайний',
        rare: 'Рідкісний',
        epic: 'Епічний',
        legendary: 'Легендарний',
    };

    const CHARACTERS = [
        {
            id: 'default',
            name: 'Vanya Classic',
            image: DEFAULT_TAP_IMAGE,
            price: 0,
            rarity: 'common',
        },
        {
            id: 'street',
            name: 'Вуличний стиль',
            image: 'https://i.ibb.co/0yZfFC0T/Gemini-Generated-Image-8t23ap8t23ap8t23.png',
            price: 600,
            rarity: 'common',
        },
        {
            id: 'neon',
            name: 'Неоновий воїн',
            image: 'https://i.ibb.co/8g7pfBc7/Gemini-Generated-Image-okjec2okjec2okje.png',
            price: 1200,
            rarity: 'rare',
        },
        {
            id: 'cyber',
            name: 'Кібер-тапер',
            image: 'https://i.ibb.co/LXqjTJDb/Gemini-Generated-Image-daw1v6daw1v6daw1.png',
            price: 2200,
            rarity: 'rare',
        },
        {
            id: 'gold',
            name: 'Золотий бос',
            image: 'https://i.ibb.co/jchZBQS/Gemini-Generated-Image-6ktip76ktip76kti.png',
            price: 4500,
            rarity: 'epic',
        },
        {
            id: 'phantom',
            name: 'Фантом',
            image: 'https://i.ibb.co/7drLTLDn/Gemini-Generated-Image-g9agf0g9agf0g9ag.png',
            price: 7500,
            rarity: 'epic',
        },
        {
            id: 'cosmic',
            name: 'Космічний Vanya',
            image: 'https://i.ibb.co/5W2cRTG0/Gemini-Generated-Image-74ftc374ftc374ft.png',
            price: 12000,
            rarity: 'legendary',
        },
        {
            id: 'emperor',
            name: 'Імператор монет',
            image: 'https://i.ibb.co/1JdRSy0w/Gemini-Generated-Image-ol0zlool0zlool0z.png',
            price: 25000,
            rarity: 'legendary',
        },
    ];

    const telegram = window.Telegram?.WebApp;
    if (telegram) {
        telegram.ready();
        telegram.expand();
        telegram.setHeaderColor('#0d0b14');
        telegram.setBackgroundColor('#12101c');
    }

    const user = telegram?.initDataUnsafe?.user;
    const userId = user?.id ? String(user.id) : 'guest';
    const storagePrefix = `vanya_${userId}_`;

    function migrateLegacySave() {
        if (localStorage.getItem(storagePrefix + 'balance') !== null) return;
        const legacyBalance = parseInt(localStorage.getItem('balance'), 10);
        if (!Number.isNaN(legacyBalance) && legacyBalance > 0) {
            localStorage.setItem(storagePrefix + 'balance', JSON.stringify(legacyBalance));
            localStorage.setItem(storagePrefix + 'clickValue', localStorage.getItem('clickValue') || '1');
        }
    }
    migrateLegacySave();

    function load(key, fallback) {
        try {
            const raw = localStorage.getItem(storagePrefix + key);
            return raw !== null ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function save(key, value) {
        try { localStorage.setItem(storagePrefix + key, JSON.stringify(value)); }
        catch (error) { console.warn('KravetsCoin: save failed', error); }
    }

    const state = {
        balance: load('balance', 0),
        xp: load('xp', 0),
        totalTaps: load('totalTaps', 0),
        totalEarned: load('totalEarned', 0),
        totalUpgrades: load('totalUpgrades', 0),
        referralCount: load('referralCount', 0),
        dailyClaims: load('dailyClaims', 0),
        dailyStreak: load('dailyStreak', 0),
        lastDailyClaim: load('lastDailyClaim', null),
        completedTasks: load('completedTasks', []),
        upgradeLevels: load('upgradeLevels', {}),
        energy: load('energy', 500),
        maxEnergy: load('maxEnergy', 500),
        energyRegen: load('energyRegen', CONFIG.energyRegenPerSec),
        boostActiveUntil: load('boostActiveUntil', 0),
        referredBy: load('referredBy', null),
        referralProcessed: load('referralProcessed', false),
        ownedCharacters: load('ownedCharacters', ['default']),
        activeCharacter: load('activeCharacter', 'default'),
        criticalTaps: load('criticalTaps', 0),
        totalSpent: load('totalSpent', 0),
        bestCombo: load('bestCombo', 0),
        lastSeenAt: load('lastSeenAt', Date.now()),
        luckyDrops: load('luckyDrops', 0),
        bossesDefeated: load('bossesDefeated', 0),
        bossIndex: load('bossIndex', 0),
        bossHp: load('bossHp', null),
        casesOpened: load('casesOpened', 0),
        miniGamesPlayed: load('miniGamesPlayed', 0),
        bestReaction: load('bestReaction', 0),
        memoryWins: load('memoryWins', 0),
        guessWins: load('guessWins', 0),
        wheelDate: load('wheelDate', ''),
        wheelPaidSpins: load('wheelPaidSpins', 0),
        prestige: load('prestige', 0),
        prestigeLevel: load('prestigeLevel', 0),
        prestigeMultiplier: load('prestigeMultiplier', 1),
        achievements: load('achievements', []),
        contractsDate: load('contractsDate', ''),
        contracts: load('contracts', {}),
        arcadeTotalRewards: load('arcadeTotalRewards', 0),
    };

    if (!Array.isArray(state.ownedCharacters)) state.ownedCharacters = ['default'];
    if (!state.ownedCharacters.includes('default')) state.ownedCharacters.unshift('default');
    if (!state.upgradeLevels || typeof state.upgradeLevels !== 'object' || Array.isArray(state.upgradeLevels)) state.upgradeLevels = {};

    ['balance', 'xp', 'totalTaps', 'totalEarned', 'totalUpgrades', 'referralCount',
     'dailyClaims', 'dailyStreak', 'energy', 'maxEnergy', 'energyRegen',
     'criticalTaps', 'totalSpent', 'bestCombo', 'luckyDrops'].forEach((key) => {
        if (!Number.isFinite(Number(state[key])) || Number(state[key]) < 0) state[key] = 0;
        else state[key] = Number(state[key]);
    });
    if (!Array.isArray(state.completedTasks)) state.completedTasks = [];
    if (!Array.isArray(state.achievements)) state.achievements = [];
    ['bossesDefeated','bossIndex','bossHp','casesOpened','miniGamesPlayed','bestReaction','memoryWins','guessWins','wheelPaidSpins','prestige','prestigeLevel','arcadeTotalRewards'].forEach((k) => {
        if (!Number.isFinite(Number(state[k])) || Number(state[k]) < 0) state[k] = 0;
        else state[k] = Number(state[k]);
    });
    if (!state.prestigeMultiplier || !Number.isFinite(Number(state.prestigeMultiplier))) state.prestigeMultiplier = 1;
    if (!state.contracts || typeof state.contracts !== 'object') state.contracts = {};
    if (!Array.isArray(state.ownedCharacters)) state.ownedCharacters = ['default'];
    if (!state.maxEnergy) state.maxEnergy = 500;
    state.energy = Math.min(state.energy, state.maxEnergy);

    UPGRADES.forEach((u) => {
        if (state.upgradeLevels[u.id] === undefined) state.upgradeLevels[u.id] = 0;
    });

    const legacyTap = parseInt(localStorage.getItem('clickValue'), 10);
    if (legacyTap > 1 && (state.upgradeLevels.tap || 0) < legacyTap - 1) {
        state.upgradeLevels.tap = legacyTap - 1;
    }
    const legacyAuto = parseInt(localStorage.getItem('autoClickPower'), 10);
    if (legacyAuto > 0 && (state.upgradeLevels.auto || 0) < legacyAuto) {
        state.upgradeLevels.auto = legacyAuto;
    }

    let lastClickTime = 0;
    let clickBurst = 0;
    let lastComboTapAt = 0;
    let currentCombo = 0;
    let lastAutosaveAt = Date.now();
    let boostTimer = null;
    let pendingCharacterId = null;

    const $ = (id) => document.getElementById(id);

    const els = {
        balance: $('balance'),
        perTap: $('per-tap'),
        levelNum: $('level-num'),
        levelXpText: $('level-xp-text'),
        levelProgress: $('level-progress'),
        energyFill: $('energy-fill'),
        energyText: $('energy-text'),
        userName: $('user-name'),
        userPhoto: $('user-photo'),
        userRank: $('user-rank'),
        tasksList: $('tasks-list'),
        upgradesList: $('upgrades-list'),
        ranksList: $('ranks-list'),
        referralLink: $('referral-link'),
        referralCount: $('referral-count'),
        refBonusText: $('ref-bonus-text'),
        statTaps: $('stat-taps'),
        statEarned: $('stat-earned'),
        statFriends: $('stat-friends'),
        statTasks: $('stat-tasks'),
        walletBalance: $('wallet-balance'),
        walletAuto: $('wallet-auto'),
        walletTap: $('wallet-tap'),
        boostBtn: $('boost-btn'),
        boostLabel: $('boost-label'),
        boostIcon: $('boost-icon'),
        timeerror: $('timeerror'),
        panelOverlay: $('panel-overlay'),
        closeBtn: $('close_id'),
        toast: $('toast'),
        headerBalance: $('header-balance'),
        tapSkin: $('tap-skin'),
        charactersGrid: $('characters-grid'),
        skinInventory: $('skin-inventory'),
        characterModal: $('character-modal'),
        characterModalPreview: $('character-modal-preview'),
        characterModalTitle: $('character-modal-title'),
        characterModalRarity: $('character-modal-rarity'),
        characterModalPrice: $('character-modal-price'),
        characterModalBuy: $('character-modal-buy'),
        characterModalCancel: $('character-modal-cancel'),
        characterModalClose: $('character-modal-close'),
    };

    function getLevelInfo() {
        let current = LEVELS[0];
        let next = LEVELS[1] || null;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (state.xp >= LEVELS[i].xpRequired) {
                current = LEVELS[i];
                next = LEVELS[i + 1] || null;
                break;
            }
        }
        return { current, next };
    }

    function getTapPower() {
        const base = 1 + (state.upgradeLevels.tap || 0);
        const mult = isBoostActive() ? CONFIG.boostMultiplier : 1;
        return base * mult * (state.prestigeMultiplier || 1);
    }

    function getAutoIncome() {
        return (state.upgradeLevels.auto || 0) * (state.prestigeMultiplier || 1);
    }

    function getCritChance() {
        return Math.min(0.5, (state.upgradeLevels.crit || 0) * 0.02);
    }

    function isBoostActive() {
        return Date.now() < state.boostActiveUntil;
    }

    function persist() {
        Object.keys(state).forEach((k) => save(k, state[k]));
    }

    function formatNum(n) {
        return Math.floor(n).toLocaleString('uk-UA');
    }

    function getCharacterById(id) {
        return CHARACTERS.find((c) => c.id === id);
    }

    function isCharacterOwned(id) {
        return state.ownedCharacters.includes(id);
    }

    function getActiveCharacter() {
        return getCharacterById(state.activeCharacter) || CHARACTERS[0];
    }

    function applyTapSkin() {
        const ch = getActiveCharacter();
        if (els.tapSkin && ch) {
            els.tapSkin.src = ch.image;
            els.tapSkin.alt = ch.name;
        }
    }

    function equipCharacter(id) {
        if (!isCharacterOwned(id)) {
            showToast('Спочатку купи цього персонажа');
            return;
        }
        state.activeCharacter = id;
        persist();
        applyTapSkin();
        renderCharacters();
        renderSkinInventory();
        const ch = getCharacterById(id);
        showToast(`🎭 Обрано: ${ch?.name || id}`);
        haptic('medium');
    }

    function openCharacterModal(characterId) {
        const ch = getCharacterById(characterId);
        if (!ch || ch.id === 'default') return;

        pendingCharacterId = characterId;
        els.characterModalPreview.innerHTML = `<img src="${ch.image}" alt="${ch.name}">`;
        els.characterModalTitle.textContent = ch.name;
        els.characterModalRarity.textContent = `${RARITY_LABELS[ch.rarity] || ch.rarity}`;
        els.characterModalRarity.className = `character-modal-rarity rarity-${ch.rarity}`;
        els.characterModalPrice.textContent = `Ціна: ${formatNum(ch.price)} $VANYA`;
        els.characterModalBuy.disabled = state.balance < ch.price;
        els.characterModal.setAttribute('aria-hidden', 'false');
        els.characterModal.classList.add('is-open');
    }

    function closeCharacterModal() {
        pendingCharacterId = null;
        els.characterModal.classList.remove('is-open');
        els.characterModal.setAttribute('aria-hidden', 'true');
    }

    function confirmBuyCharacter() {
        if (!pendingCharacterId) return;
        const ch = getCharacterById(pendingCharacterId);
        if (!ch) return;

        if (isCharacterOwned(ch.id)) {
            closeCharacterModal();
            equipCharacter(ch.id);
            return;
        }

        if (state.balance < ch.price) {
            telegram?.HapticFeedback?.notificationOccurred?.('error');
            showToast('Недостатньо монет');
            return;
        }

        state.balance -= ch.price;
        state.totalSpent += ch.price;
        if (!state.ownedCharacters.includes(ch.id)) {
            state.ownedCharacters.push(ch.id);
        }
        state.activeCharacter = ch.id;
        persist();
        applyTapSkin();
        closeCharacterModal();
        updateUI();
        renderCharacters();
        renderSkinInventory();
        showToast(`🎭 Куплено: ${ch.name}!`);
        checkTasks();
        telegram?.HapticFeedback?.notificationOccurred?.('success');
        haptic('heavy');
    }

    function onCharacterCardClick(characterId) {
        const ch = getCharacterById(characterId);
        if (!ch) return;

        if (isCharacterOwned(ch.id)) {
            equipCharacter(ch.id);
            return;
        }

        openCharacterModal(characterId);
    }

    function renderSkinInventory() {
        if (!els.skinInventory) return;

        const owned = state.ownedCharacters
            .map((id) => getCharacterById(id))
            .filter(Boolean);

        els.skinInventory.innerHTML = owned.map((ch) => {
            const active = state.activeCharacter === ch.id;
            return `
                <button type="button" class="skin-inv-item ${active ? 'is-active' : ''}" data-skin="${ch.id}">
                    <img src="${ch.image}" alt="${ch.name}">
                    <span class="skin-inv-name">${ch.name}</span>
                    ${active ? '<span class="skin-inv-badge">Обрано</span>' : ''}
                </button>`;
        }).join('');

        els.skinInventory.querySelectorAll('[data-skin]').forEach((btn) => {
            btn.addEventListener('click', () => equipCharacter(btn.dataset.skin));
        });
    }

    function renderCharacters() {
        if (!els.charactersGrid) return;

        const shopItems = CHARACTERS.filter((c) => c.id !== 'default');

        els.charactersGrid.innerHTML = shopItems.map((ch) => {
            const owned = isCharacterOwned(ch.id);
            const active = state.activeCharacter === ch.id;
            const canAfford = state.balance >= ch.price;

            return `
                <button type="button" class="character-card rarity-${ch.rarity} ${owned ? 'is-owned' : ''} ${active ? 'is-equipped' : ''}"
                    data-character="${ch.id}">
                    <div class="character-card-img">
                        <img src="${ch.image}" alt="${ch.name}" loading="lazy">
                    </div>
                    <span class="character-rarity rarity-${ch.rarity}">${RARITY_LABELS[ch.rarity]}</span>
                    <span class="character-name">${ch.name}</span>
                    <span class="character-price">${owned ? '✓ У інвентарі' : `🪙 ${formatNum(ch.price)}`}</span>
                    ${!owned && !canAfford ? '<span class="character-lock">Недостатньо монет</span>' : ''}
                    ${active ? '<span class="character-equipped">На кнопці</span>' : ''}
                </button>`;
        }).join('');

        els.charactersGrid.querySelectorAll('[data-character]').forEach((card) => {
            card.addEventListener('click', () => onCharacterCardClick(card.dataset.character));
        });

        renderSkinInventory();
    }

    function showToast(msg) {
        els.toast.textContent = msg;
        els.toast.classList.add('toast-visible');
        setTimeout(() => els.toast.classList.remove('toast-visible'), 2200);
    }

    function haptic(type) {
        telegram?.HapticFeedback?.impactOccurred?.(type || 'light');
    }

    function addCoins(amount, source = 'tap') {
        if (amount <= 0) return;
        state.balance += amount;
        state.totalEarned += amount;
        if (source === 'tap') {
            state.xp += Math.max(1, Math.floor(amount * 0.5));
        } else {
            state.xp += Math.floor(amount * 0.3);
        }
        checkLevelUp();
        persist();
        updateUI();
    }

    function checkLevelUp() {
        const { current } = getLevelInfo();
        const prevLevel = load('_lastLevel', 1);
        if (current.level > prevLevel) {
            save('_lastLevel', current.level);
            showToast(`🎉 Новий рівень ${current.level}: ${current.rank}!`);
            telegram?.HapticFeedback?.notificationOccurred?.('success');
            unlockBoostIfNeeded();
        }
    }

    function unlockBoostIfNeeded() {
        if (!els.boostBtn) return;
        const { current } = getLevelInfo();
        if (current.level >= CONFIG.boostUnlockLevel) {
            els.boostBtn.disabled = false;
            if (els.boostIcon) els.boostIcon.src = 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png';
            if (els.boostLabel) els.boostLabel.textContent = isBoostActive()
                ? `Буст x2 активний!`
                : 'Увімкнути буст x2 (30 сек)';
        }
    }

    function getUpgradeCost(upgrade) {
        const lvl = state.upgradeLevels[upgrade.id] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, lvl));
    }

    function buyUpgrade(upgradeId) {
        const upgrade = UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return;
        const lvl = state.upgradeLevels[upgradeId] || 0;
        if (lvl >= upgrade.maxLevel) {
            showToast('Максимальний рівень!');
            return;
        }
        const cost = getUpgradeCost(upgrade);
        if (state.balance < cost) {
            telegram?.HapticFeedback?.notificationOccurred?.('error');
            showToast('Недостатньо монет');
            return;
        }
        state.balance -= cost;
        state.totalSpent += cost;
        state.upgradeLevels[upgradeId] = lvl + 1;
        state.totalUpgrades += 1;

        if (upgradeId === 'energy') {
            state.maxEnergy += 100;
            state.energy = Math.min(state.maxEnergy, state.energy + 100);
        }
        if (upgradeId === 'regen') {
            state.energyRegen += 0.5;
        }

        haptic('medium');
        showToast(`${upgrade.name} → рівень ${lvl + 1}`);
        persist();
        updateUI();
        renderUpgrades();
        checkTasks();
    }

    function completeTask(taskId) {
        if (state.completedTasks.includes(taskId)) return;
        const task = TASKS.find((t) => t.id === taskId);
        if (!task || !task.check(getTaskSnapshot())) return;

        state.completedTasks.push(taskId);
        state.xp += task.xp;
        addCoins(task.reward, 'task');
        showToast(`✅ ${task.title}: +${formatNum(task.reward)}`);
        telegram?.HapticFeedback?.notificationOccurred?.('success');
        persist();
        renderTasks();
        updateUI();
    }

    function getTaskSnapshot() {
        const { current } = getLevelInfo();
        return {
            totalTaps: state.totalTaps,
            level: current.level,
            totalUpgrades: state.totalUpgrades,
            referralCount: state.referralCount,
            totalEarned: state.totalEarned,
            dailyClaims: state.dailyClaims,
            criticalTaps: state.criticalTaps,
            totalSpent: state.totalSpent,
            bestCombo: state.bestCombo,
            ownedCharacters: state.ownedCharacters,
            bossesDefeated: state.bossesDefeated, casesOpened: state.casesOpened,
            miniGamesPlayed: state.miniGamesPlayed, bestReaction: state.bestReaction,
            memoryWins: state.memoryWins, guessWins: state.guessWins,
            wheelPaidSpins: state.wheelPaidSpins, prestige: state.prestige,
            totalTaps: state.totalTaps, contractsDone: Object.values(state.contracts).filter(x => x.claimed).length,
        };
    }

    function checkTasks() {
        TASKS.forEach((t) => {
            if (!state.completedTasks.includes(t.id) && t.check(getTaskSnapshot())) {
                /* auto-complete only when user opens tasks or we call explicitly */
            }
        });
        renderTasks();
    }

    function claimDaily() {
        const today = new Date().toDateString();
        if (state.lastDailyClaim === today) {
            showToast('Щоденний бонус вже забрано сьогодні');
            return;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (state.lastDailyClaim === yesterday.toDateString()) {
            state.dailyStreak = Math.min(state.dailyStreak + 1, DAILY_REWARDS.length - 1);
        } else if (state.lastDailyClaim !== today) {
            state.dailyStreak = 0;
        }

        const reward = DAILY_REWARDS[state.dailyStreak] || DAILY_REWARDS[DAILY_REWARDS.length - 1];
        state.lastDailyClaim = today;
        state.dailyClaims += 1;
        addCoins(reward, 'daily');
        showToast(`🎁 День ${state.dailyStreak + 1}: +${formatNum(reward)} $VANYA`);
        haptic('heavy');
        persist();
        checkTasks();
    }

    function activateBoost() {
        const { current } = getLevelInfo();
        if (current.level < CONFIG.boostUnlockLevel) {
            showToast(`Відкриється на рівні ${CONFIG.boostUnlockLevel}`);
            return;
        }
        if (isBoostActive()) {
            showToast('Буст вже активний');
            return;
        }
        state.boostActiveUntil = Date.now() + CONFIG.boostDurationMs;
        persist();
        unlockBoostIfNeeded();
        showToast('🔥 Буст x2 на 30 секунд!');
        haptic('heavy');

        if (boostTimer) clearTimeout(boostTimer);
        boostTimer = setTimeout(() => {
            unlockBoostIfNeeded();
            updateUI();
        }, CONFIG.boostDurationMs);
    }

    function getReferralLink() {
        const bot = (CONFIG.botUsername || 'KravetsCoin_bot').replace(/^@/, '');
        const param = `ref_${userId}`;
        return `https://t.me/${bot}?startapp=${param}`;
    }

    function processReferral() {
        if (state.referralProcessed) return;
        const startParam = telegram?.initDataUnsafe?.start_param;
        if (!startParam || !startParam.startsWith('ref_')) return;

        const referrerId = startParam.replace('ref_', '');
        if (referrerId === userId) return;

        state.referredBy = referrerId;
        state.referralProcessed = true;
        addCoins(CONFIG.newUserBonus, 'referral');
        showToast(`🎁 Вітальний бонус: +${CONFIG.newUserBonus} $VANYA`);

        const refKey = `vanya_${referrerId}_pendingRefs`;
        let pending = [];
        try {
            const parsed = JSON.parse(localStorage.getItem(refKey) || '[]');
            pending = Array.isArray(parsed) ? parsed : [];
        } catch { pending = []; }
        if (!pending.includes(userId)) {
            pending.push(userId);
            localStorage.setItem(refKey, JSON.stringify(pending));
        }
        persist();
    }

    function processPendingReferrals() {
        const refKey = `${storagePrefix}pendingRefs`;
        let pending = [];
        try {
            const parsed = JSON.parse(localStorage.getItem(refKey) || '[]');
            pending = Array.isArray(parsed) ? [...new Set(parsed)] : [];
        } catch { pending = []; }
        if (!pending.length) return;

        let count = 0;
        pending.forEach((referredUserId) => {
            if (!referredUserId || referredUserId === userId) return;
            state.referralCount += 1;
            addCoins(CONFIG.referralBonus, 'referral');
            count += 1;
        });
        localStorage.removeItem(refKey);
        if (count > 0) {
            showToast(`👥 +${count} друзів! +${formatNum(count * CONFIG.referralBonus)} $VANYA`);
            persist();
        }
    }

    function onTap(event) {
        if (state.energy < 1) {
            showToast('⚡ Немає енергії! Зачекай...');
            telegram?.HapticFeedback?.notificationOccurred?.('warning');
            return;
        }

        const now = Date.now();
        if (now - lastClickTime < 100) {
            clickBurst++;
        } else {
            clickBurst = 1;
        }
        lastClickTime = now;

        if (clickBurst > CONFIG.maxClicksPer100ms) {
            els.timeerror.style.display = 'block';
            setTimeout(() => { els.timeerror.style.display = 'none'; }, 5000);
            return;
        }

        // Комбо зберігається, якщо гравець натискає не рідше ніж раз на 1,2 секунди.
        if (now - lastComboTapAt <= 1200) currentCombo += 1;
        else currentCombo = 1;
        lastComboTapAt = now;
        state.bestCombo = Math.max(state.bestCombo, currentCombo);

        const comboMultiplier = currentCombo >= 50 ? 3 : currentCombo >= 25 ? 2 : currentCombo >= 10 ? 1.5 : 1;
        let reward = Math.floor(getTapPower() * comboMultiplier);
        const isCritical = Math.random() < getCritChance();
        if (isCritical) {
            reward *= 3;
            state.criticalTaps += 1;
            haptic('heavy');
        } else {
            haptic('light');
        }

        // Рідкісний бонус: випадкова знахідка приблизно раз на 80 тапів.
        let luckyBonus = 0;
        if (state.totalTaps > 0 && state.totalTaps % 80 === 0) {
            luckyBonus = Math.max(25, Math.floor(getTapPower() * (10 + Math.random() * 40)));
            state.luckyDrops += 1;
        }

        state.energy -= 1;
        state.totalTaps += 1;
        addCoins(reward + luckyBonus, 'tap');
        const comboLabel = comboMultiplier > 1 ? ` · COMBO x${comboMultiplier}` : '';
        const luckyLabel = luckyBonus ? ` · 🎁 +${formatNum(luckyBonus)}` : '';
        if (els.comboText) els.comboText.textContent = `🔥 Комбо: ${currentCombo} ${comboLabel}`;
        if (luckyBonus) showToast(`🎁 Щаслива знахідка! +${formatNum(luckyBonus)} $VANYA`);

        const unit = document.createElement('div');
        unit.className = 'unit';
        unit.innerText = `+${reward}`;
        const x = event.clientX || window.innerWidth / 2;
        const y = (event.clientY || window.innerHeight / 2) - 30;
        unit.style.left = `${x}px`;
        unit.style.top = `${y}px`;
        document.body.appendChild(unit);
        setTimeout(() => {
            unit.style.opacity = '0';
            unit.style.transform = 'translateY(-40px)';
        }, 50);
        setTimeout(() => unit.remove(), 600);

        checkTasks();
        renderContracts();
    }

    function renderTasks() {
        const snap = getTaskSnapshot();
        els.tasksList.innerHTML = TASKS.map((task) => {
            const done = state.completedTasks.includes(task.id);
            const ready = !done && task.check(snap);
            const btnClass = done ? 'task-btn done' : ready ? 'task-btn claim' : 'task-btn';
            const btnText = done ? '✓ Готово' : ready ? 'Забрати' : 'В процесі';
            const progress = getTaskProgress(task, snap);
            return `
                <div class="task-card ${done ? 'task-done' : ''}">
                    <div class="task-info">
                        <p class="task-title">${task.title}</p>
                        <p class="task-desc">${task.desc}</p>
                        <p class="task-reward">🪙 ${formatNum(task.reward)} · ⭐ ${task.xp} XP</p>
                        ${progress ? `<div class="task-progress-wrap"><div class="task-progress" style="width:${progress}%"></div></div>` : ''}
                    </div>
                    <button type="button" class="${btnClass}" data-task="${task.id}" ${done || !ready ? 'disabled' : ''}>${btnText}</button>
                </div>`;
        }).join('');

        els.tasksList.querySelectorAll('.task-btn.claim').forEach((btn) => {
            btn.addEventListener('click', () => completeTask(btn.dataset.task));
        });
    }

    function getTaskProgress(task, snap) {
        if (task.id === 'tap100') return Math.min(100, (snap.totalTaps / 100) * 100);
        if (task.id === 'tap1000') return Math.min(100, (snap.totalTaps / 1000) * 100);
        if (task.id === 'level3') return Math.min(100, (snap.level / 3) * 100);
        if (task.id === 'level5') return Math.min(100, (snap.level / 5) * 100);
        if (task.id === 'invite1') return Math.min(100, snap.referralCount * 100);
        if (task.id === 'balance10k') return Math.min(100, (snap.totalEarned / 10000) * 100);
        if (task.id === 'daily3') return Math.min(100, (snap.dailyClaims / 3) * 100);
        if (task.id === 'buyUpgrade') return snap.totalUpgrades >= 1 ? 100 : 0;
        const targets = {
            tap250: [snap.totalTaps, 250],
            tap5000: [snap.totalTaps, 5000],
            earn50000: [snap.totalEarned, 50000],
            upgrade5: [snap.totalUpgrades, 5],
            upgrade20: [snap.totalUpgrades, 20],
            crit25: [snap.criticalTaps, 25],
            spend10000: [snap.totalSpent, 10000],
            combo25: [snap.bestCombo, 25],
            level7: [snap.level, 7],
            skins3: [snap.ownedCharacters.length, 3],
        };
        if (targets[task.id]) return Math.min(100, targets[task.id][0] / targets[task.id][1] * 100);
        const expanded = {
            boss1:[snap.bossesDefeated,1], boss3:[snap.bossesDefeated,3], boss5:[snap.bossesDefeated,5],
            case1:[snap.casesOpened,1], case10:[snap.casesOpened,10],
            arcade3:[snap.miniGamesPlayed,3], arcade10:[snap.miniGamesPlayed,10],
            memory3:[snap.memoryWins,3], guess3:[snap.guessWins,3], wheel3:[snap.wheelPaidSpins,3],
            contract1:[snap.contractsDone,1], prestige1:[snap.prestige,1],
            earn100k:[snap.totalEarned,100000], tap10000:[snap.totalTaps,10000]
        };
        if (task.id === 'reaction') return snap.bestReaction > 0 ? 100 : 0;
        if (expanded[task.id]) return Math.min(100, expanded[task.id][0] / expanded[task.id][1] * 100);
        return null;
    }

    function renderUpgrades() {
        els.upgradesList.innerHTML = UPGRADES.map((u) => {
            const lvl = state.upgradeLevels[u.id] || 0;
            const cost = getUpgradeCost(u);
            const maxed = lvl >= u.maxLevel;
            return `
                <div class="upgrade-card">
                    <div class="upgrade-icon">${u.icon}</div>
                    <div class="upgrade-info">
                        <p class="upgrade-name">${u.name} <span class="lvl-tag">Lv.${lvl}</span></p>
                        <p class="upgrade-desc">${u.desc}</p>
                        <p class="upgrade-price">Ціна: <strong>${maxed ? 'MAX' : formatNum(cost)}</strong></p>
                    </div>
                    <button type="button" class="buy-button" data-upgrade="${u.id}" ${maxed ? 'disabled' : ''}>
                        ${maxed ? 'MAX' : 'Купити'}
                    </button>
                </div>`;
        }).join('');

        els.upgradesList.querySelectorAll('[data-upgrade]').forEach((btn) => {
            btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade));
        });
    }

    function renderRanks() {
        const { current } = getLevelInfo();
        els.ranksList.innerHTML = LEVELS.map((l) => {
            const reached = state.xp >= l.xpRequired;
            return `<li class="${reached ? 'rank-reached' : ''}">${reached ? '✅' : '🔒'} Lv.${l.level} — ${l.rank}</li>`;
        }).join('');
        els.userRank.textContent = current.rank;
    }

    function updateUI() {
        const { current, next } = getLevelInfo();
        els.balance.textContent = formatNum(state.balance);
        if (els.headerBalance) els.headerBalance.textContent = formatNum(state.balance);
        els.perTap.textContent = `+${getTapPower()} за тап${isBoostActive() ? ' 🔥' : ''}`;
        applyTapSkin();

        els.levelNum.textContent = current.level;
        const xpInLevel = state.xp - current.xpRequired;
        const xpNeeded = next ? next.xpRequired - current.xpRequired : 1;
        const pct = next ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100;
        els.levelProgress.style.width = `${pct}%`;
        els.levelXpText.textContent = next
            ? `${formatNum(xpInLevel)} / ${formatNum(xpNeeded)} XP`
            : 'MAX рівень';

        const energyPct = (state.energy / state.maxEnergy) * 100;
        els.energyFill.style.width = `${energyPct}%`;
        els.energyText.textContent = `${Math.floor(state.energy)} / ${state.maxEnergy}`;

        els.statTaps.textContent = formatNum(state.totalTaps);
        els.statEarned.textContent = formatNum(state.totalEarned);
        els.statFriends.textContent = formatNum(state.referralCount);
        els.statTasks.textContent = `${state.completedTasks.length}/${TASKS.length}`;
        const luckyStat = $('stat-lucky');
        if (luckyStat) luckyStat.textContent = formatNum(state.luckyDrops);
        const critStat = $('stat-crits');
        if (critStat) critStat.textContent = formatNum(state.criticalTaps);

        els.walletBalance.textContent = formatNum(state.balance);
        els.walletAuto.textContent = formatNum(getAutoIncome());
        els.walletTap.textContent = formatNum(getTapPower());

        els.referralCount.textContent = state.referralCount;
        els.refBonusText.textContent = formatNum(CONFIG.referralBonus);
        els.referralLink.value = getReferralLink();

        renderRanks();
        unlockBoostIfNeeded();
        checkAchievements();
        renderPrestige();
    }

    function openTab(tabId, btn) {
        document.querySelectorAll('.tab').forEach((t) => { t.style.display = 'none'; });
        document.querySelectorAll('.tablinks').forEach((link) => {
            link.classList.remove('tablinks-active');
            const img = link.querySelector('img');
            if (img) img.src = link.dataset.defaultIcon;
        });

        if (tabId === 'home') {
            closePanel();
            return;
        }

        const tab = document.getElementById(tabId);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.remove('panel-animate');
            void tab.offsetWidth;
            tab.classList.add('panel-animate');
        }

        els.panelOverlay.classList.add('is-open');
        document.body.classList.add('panel-open');

        if (btn) {
            btn.classList.add('tablinks-active');
            const activeImg = btn.querySelector('img');
            if (activeImg) activeImg.src = btn.dataset.activeIcon;
        }

        if (tabId === 'tab1') renderRanks();
        if (tabId === 'tab2') renderTasks();
        if (tabId === 'tab3') renderUpgrades();
        if (tabId === 'tab5') renderCharacters();
        if (tabId === 'tab6') renderArcade();
    }

    function closePanel() {
        closeCharacterModal();
        els.panelOverlay.classList.remove('is-open');
        document.body.classList.remove('panel-open');
        document.querySelectorAll('.tab').forEach((t) => { t.style.display = 'none'; });
        document.querySelectorAll('.tablinks').forEach((link) => {
            link.classList.remove('tablinks-active');
            const img = link.querySelector('img');
            if (img) img.src = link.dataset.defaultIcon;
        });
    }


    // ——— Arcade systems: browser-only, persisted in the existing save ———
    const BOSSES = [
        { name:'Піксельний гоблін', icon:'👺', hp:120, reward:1800 },
        { name:'Крипто-огр', icon:'👹', hp:650, reward:6500 },
        { name:'Тіньовий майнер', icon:'🧟', hp:2800, reward:18000 },
        { name:'Золотий дракон', icon:'🐉', hp:11000, reward:55000 },
        { name:'Імператор безодні', icon:'👑', hp:50000, reward:150000 }
    ];
    const ACHIEVEMENTS = [
        {id:'a_tap',name:'Перший клік',desc:'Зроби 1 тап',test:()=>state.totalTaps>=1,reward:100},
        {id:'a_tap1k',name:'Тапер 1000',desc:'Зроби 1 000 тапів',test:()=>state.totalTaps>=1000,reward:800},
        {id:'a_earn',name:'Капітал',desc:'Зароби 10 000 монет',test:()=>state.totalEarned>=10000,reward:700},
        {id:'a_boss',name:'Переможець',desc:'Переможи боса',test:()=>state.bossesDefeated>=1,reward:1000},
        {id:'a_cases',name:'Азарт',desc:'Відкрий 5 кейсів',test:()=>state.casesOpened>=5,reward:1200},
        {id:'a_quest',name:'Виконавець',desc:'Заверши 5 квестів',test:()=>state.completedTasks.length>=5,reward:1000},
        {id:'a_react',name:'Рефлекс',desc:'Реакція швидше 300 мс',test:()=>state.bestReaction>0&&state.bestReaction<=300,reward:1800},
        {id:'a_memory',name:'Фотографічна пам’ять',desc:'Виграй memory-гру',test:()=>state.memoryWins>=1,reward:900},
        {id:'a_prestige',name:'Переродження',desc:'Отримай престиж',test:()=>state.prestige>=1,reward:3000}
    ];
    const CONTRACTS = [
        {id:'taps',name:'Розігрів',desc:'Зроби 500 тапів',goal:500,reward:1200,read:()=>state.totalTaps},
        {id:'earn',name:'Денний прибуток',desc:'Зароби 10 000 монет',goal:10000,reward:1800,read:()=>state.totalEarned},
        {id:'boss',name:'Полювання',desc:'Переможи 2 босів',goal:2,reward:3000,read:()=>state.bossesDefeated},
        {id:'cases',name:'Розпакування',desc:'Відкрий 3 кейси',goal:3,reward:2000,read:()=>state.casesOpened},
        {id:'games',name:'Аркадний день',desc:'Зіграй у 5 мініігор',goal:5,reward:1600,read:()=>state.miniGamesPlayed}
    ];
    function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    function ensureContracts(){
        const today=todayKey();
        if(state.contractsDate!==today){ state.contractsDate=today; state.contracts={}; CONTRACTS.forEach(c=>state.contracts[c.id]={start:c.read(),claimed:false}); persist(); }
    }
    function renderContracts(){
        ensureContracts();
        const host=$('contracts-list'); if(!host)return;
        host.innerHTML=CONTRACTS.map(c=>{
            const data=state.contracts[c.id]||{start:c.read(),claimed:false};
            const value=Math.max(0,c.read()-(data.start||0));
            const pct=Math.min(100,value/c.goal*100);
            const ready=value>=c.goal&&!data.claimed;
            return `<div class="contract-card"><div style="flex:1"><strong>${c.name}</strong><small>${c.desc} · 🪙 ${formatNum(c.reward)}</small><div class="contract-progress"><span style="width:${pct}%"></span></div><small>${formatNum(Math.min(value,c.goal))} / ${formatNum(c.goal)}</small></div><button class="task-btn ${data.claimed?'done':ready?'claim':''}" data-contract="${c.id}" ${data.claimed||!ready?'disabled':''}>${data.claimed?'✓':ready?'Забрати':'В процесі'}</button></div>`;
        }).join('');
        host.querySelectorAll('[data-contract]').forEach(b=>b.addEventListener('click',()=>{
            const c=CONTRACTS.find(x=>x.id===b.dataset.contract), d=state.contracts[c.id];
            if(!c||d.claimed||Math.max(0,c.read()-(d.start||0))<c.goal)return;
            d.claimed=true; addCoins(c.reward,'contract'); state.arcadeTotalRewards+=c.reward;
            showToast(`📜 Контракт виконано: +${formatNum(c.reward)}`); persist(); renderContracts(); renderAchievements(); renderTasks();
        }));
    }
    function renderAchievements(){
        const host=$('achievements-list'); if(!host)return;
        host.innerHTML=ACHIEVEMENTS.map(a=>{
            const unlocked=state.achievements.includes(a.id);
            return `<div class="achievement ${unlocked?'unlocked':''}">${unlocked?'🏅':'🔒'} <strong>${a.name}</strong><small>${a.desc}</small><small>${unlocked?'Отримано':`Нагорода: ${formatNum(a.reward)}`}</small></div>`;
        }).join('');
    }
    function checkAchievements(){
        let changed=false;
        ACHIEVEMENTS.forEach(a=>{
            if(!state.achievements.includes(a.id)&&a.test()){
                state.achievements.push(a.id); state.balance+=a.reward; state.totalEarned+=a.reward;
                state.arcadeTotalRewards+=a.reward; changed=true;
                showToast(`🏅 Досягнення «${a.name}»! +${formatNum(a.reward)}`);
            }
        });
        if(changed){persist();renderAchievements();}
    }
    function renderBoss(){
        const host=$('boss-area'); if(!host)return;
        if(state.bossIndex>=BOSSES.length){host.innerHTML='<p class="feature-result">🏆 Усі боси переможені! Ти легенда арени.</p>';return;}
        const b=BOSSES[state.bossIndex]; if(!state.bossHp||state.bossHp>b.hp)state.bossHp=b.hp;
        const pct=Math.max(0,state.bossHp/b.hp*100);
        host.innerHTML=`<div class="boss-head"><div class="boss-avatar">${b.icon}</div><div class="boss-meta"><strong>${b.name}</strong><small>Бос ${state.bossIndex+1}/${BOSSES.length} · Нагорода ${formatNum(b.reward)} 🪙</small></div></div><div class="boss-hp"><span style="width:${pct}%"></span></div><p class="feature-note">❤️ ${formatNum(state.bossHp)} / ${formatNum(b.hp)} HP</p><button class="buy-button boss-attack" id="boss-attack">⚔️ Атакувати · ${formatNum(Math.max(1,Math.floor(getTapPower())))} шкоди</button>`;
        $('boss-attack').addEventListener('click',()=>{
            const damage=Math.max(1,Math.floor(getTapPower()*(1+(state.upgradeLevels.crit||0)*.03)));
            state.bossHp=Math.max(0,state.bossHp-damage);
            if(state.bossHp===0){
                state.bossesDefeated++; addCoins(b.reward,'boss'); state.arcadeTotalRewards+=b.reward;
                state.bossIndex++; state.bossHp=BOSSES[state.bossIndex]?.hp||0;
                showToast(`🏆 ${b.name} переможений! +${formatNum(b.reward)}`);
                checkAchievements(); checkTasks();
            } else showToast(`⚔️ -${formatNum(damage)} HP`);
            persist(); renderBoss(); renderContracts(); renderArcadeStats();
        });
    }
    function spinWheel(){
        const free=state.wheelDate!==todayKey();
        if(!free&&state.balance<2500){showToast('Потрібно 2 500 монет');return;}
        if(!free){state.balance-=2500;state.totalSpent+=2500;state.wheelPaidSpins++;}
        else state.wheelDate=todayKey();
        const prizes=[
            {name:'500 монет',weight:35,run:()=>addCoins(500,'wheel')},
            {name:'2 000 монет',weight:28,run:()=>addCoins(2000,'wheel')},
            {name:'5 000 монет',weight:18,run:()=>addCoins(5000,'wheel')},
            {name:'Буст x2 на 60 секунд',weight:12,run:()=>{state.boostActiveUntil=Math.max(Date.now(),state.boostActiveUntil)+60000;}},
            {name:'20 000 монет',weight:5,run:()=>addCoins(20000,'wheel')},
            {name:'Джекпот 50 000',weight:2,run:()=>addCoins(50000,'wheel')}
        ];
        let roll=Math.random()*100, prize=prizes[0];
        for(const p of prizes){roll-=p.weight;if(roll<=0){prize=p;break;}}
        const disc=$('wheel-disc'); disc.classList.remove('spinning'); void disc.offsetWidth; disc.classList.add('spinning');
        prize.run(); state.arcadeTotalRewards+=1; persist();
        $('wheel-result').textContent=`🎉 Випало: ${prize.name}!`;
        checkAchievements();checkTasks();renderContracts();renderArcadeStats();
    }
    function openCase(type){
        const cfg={basic:{cost:1000,table:[['common',65,500],['rare',25,1800],['epic',9,5000],['legendary',1,15000]]},
            premium:{cost:5000,table:[['common',35,2500],['rare',40,6500],['epic',20,15000],['legendary',5,50000]]},
            elite:{cost:15000,table:[['common',10,8000],['rare',35,18000],['epic',40,45000],['legendary',15,120000]]}}[type];
        if(!cfg||state.balance<cfg.cost){showToast('Недостатньо монет для кейса');return;}
        state.balance-=cfg.cost;state.totalSpent+=cfg.cost;state.casesOpened++;
        let r=Math.random()*100,chosen=cfg.table[0];
        for(const item of cfg.table){r-=item[1];if(r<=0){chosen=item;break;}}
        const [rarity,reward]=[chosen[0],chosen[2]];
        addCoins(reward,'case');state.arcadeTotalRewards+=reward;
        const labels={common:'Звичайна',rare:'Рідкісна',epic:'Епічна',legendary:'ЛЕГЕНДАРНА'};
        const host=$('case-result');host.classList.remove('reveal');void host.offsetWidth;host.classList.add('reveal');
        host.textContent=`${rarity==='legendary'?'👑':'🎁'} ${labels[rarity]} нагорода: +${formatNum(reward)} монет!`;
        persist();checkAchievements();checkTasks();renderContracts();renderArcadeStats();
    }
    let reactionTimer=null,reactionStart=0,reactionReady=false;
    function startReaction(){
        clearTimeout(reactionTimer);reactionReady=false;
        const light=$('reaction-light');light.className='reaction-light waiting';light.textContent='Чекай на зелений сигнал…';
        $('reaction-start').disabled=true;
        reactionTimer=setTimeout(()=>{reactionReady=true;reactionStart=performance.now();light.className='reaction-light ready';light.textContent='НАТИСКАЙ!';},1200+Math.random()*3000);
    }
    $('reaction-light')?.addEventListener('click',()=>{
        const light=$('reaction-light');
        if(!reactionReady){if($('reaction-start').disabled){clearTimeout(reactionTimer);$('reaction-start').disabled=false;light.className='reaction-light';light.textContent='Занадто рано! Спробуй ще.';}return;}
        const ms=Math.round(performance.now()-reactionStart);reactionReady=false;$('reaction-start').disabled=false;
        state.miniGamesPlayed++;state.bestReaction=state.bestReaction?Math.min(state.bestReaction,ms):ms;
        const reward=ms<250?5000:ms<350?3000:ms<500?1500:500;addCoins(reward,'reaction');
        $('reaction-result').textContent=`⏱️ ${ms} мс · +${formatNum(reward)} монет · Рекорд: ${state.bestReaction} мс`;
        persist();checkAchievements();checkTasks();renderContracts();renderArcadeStats();
    });
    $('reaction-start')?.addEventListener('click',startReaction);
    let memoryAnswer=[];
    $('memory-start')?.addEventListener('click',()=>{
        memoryAnswer=Array.from({length:4},()=>Math.floor(Math.random()*4));
        const icons=['🟥','🟦','🟩','🟨'];const box=$('memory-sequence');
        box.textContent=memoryAnswer.map(n=>icons[n]).join(' ');$('memory-input').disabled=true;
        setTimeout(()=>{box.textContent='Яка була послідовність?';$('memory-input').disabled=false;},2200);
    });
    $('memory-input')?.addEventListener('click',()=>{
        const answer=prompt('Введи 4 цифри послідовності: 1=🟥, 2=🟦, 3=🟩, 4=🟨');
        if(answer===null)return;
        state.miniGamesPlayed++;
        if(answer.replace(/\s/g,'')===memoryAnswer.map(n=>n+1).join('')){
            state.memoryWins++;addCoins(3500,'memory');$('memory-result').textContent='🎉 Правильно! +3 500 монет';
        }else $('memory-result').textContent=`Не збіглося. Було: ${memoryAnswer.map(n=>n+1).join(' ')}`;
        persist();checkAchievements();checkTasks();renderContracts();renderArcadeStats();$('memory-input').disabled=true;
    });
    $('guess-buttons')?.addEventListener('click',e=>{
        const btn=e.target.closest('[data-guess]');if(!btn)return;
        const answer=1+Math.floor(Math.random()*5),guess=Number(btn.dataset.guess);
        state.miniGamesPlayed++;
        if(answer===guess){state.guessWins++;addCoins(2000,'guess');$('guess-result').textContent=`🎯 Влучив! Було ${answer}. +2 000 монет`;}
        else $('guess-result').textContent=`Не цього разу — було ${answer}. Спробуй ще!`;
        persist();checkAchievements();checkTasks();renderContracts();renderArcadeStats();
    });
    function renderPrestige(){
        $('prestige-info').textContent=`Престиж: ${state.prestige} · Множник: x${state.prestigeMultiplier.toFixed(2)}. Для нового престижу потрібно 250 000 зароблених монет і рівень 5. Престиж зберігає персонажів, досягнення, квести та статистику, але скидає баланс, XP, покращення, енергію та прогрес босів.`;
        $('prestige-button').disabled=state.totalEarned<250000||getLevelInfo().current.level<5;
        $('prestige-upgrade').disabled=state.prestige<1;
    }
    $('prestige-button')?.addEventListener('click',()=>{
        if(state.totalEarned<250000||getLevelInfo().current.level<5){showToast('Потрібно 250 000 зароблених монет і рівень 5');return;}
        if(!confirm('Підтвердити престиж? Баланс, XP, апгрейди та боси буде скинуто.'))return;
        state.prestige++;state.prestigeMultiplier+=0.1;state.balance=0;state.xp=0;state.totalSpent=0;
        state.totalUpgrades=0;Object.keys(state.upgradeLevels).forEach(k=>state.upgradeLevels[k]=0);
        state.energy=state.maxEnergy=500;state.energyRegen=CONFIG.energyRegenPerSec;
        state.bossIndex=0;state.bossHp=BOSSES[0].hp;
        persist();renderUpgrades();renderBoss();renderPrestige();updateUI();checkAchievements();showToast('✨ Престиж активовано! Постійний бонус +10%');
    });
    $('prestige-upgrade')?.addEventListener('click',()=>{
        if(state.prestige<1)return;
        state.prestige--;state.prestigeLevel++;state.prestigeMultiplier+=0.15;
        persist();renderPrestige();updateUI();showToast('✨ Постійний множник покращено!');
    });
    function renderArcadeStats(){
        const host=$('arcade-stats');if(!host)return;
        host.innerHTML=`<div class="stat-card"><span>Перемоги над босами</span><strong>${state.bossesDefeated}</strong></div><div class="stat-card"><span>Відкрито кейсів</span><strong>${state.casesOpened}</strong></div><div class="stat-card"><span>Мініігор зіграно</span><strong>${state.miniGamesPlayed}</strong></div><div class="stat-card"><span>Найкраща реакція</span><strong>${state.bestReaction?state.bestReaction+' мс':'—'}</strong></div><div class="stat-card"><span>Престиж</span><strong>${state.prestige}</strong></div><div class="stat-card"><span>Аркадні нагороди</span><strong>${formatNum(state.arcadeTotalRewards)}</strong></div>`;
    }
    function renderArcade(){
        ensureContracts();renderBoss();renderContracts();renderAchievements();renderPrestige();renderArcadeStats();
        $('wheel-spin').textContent=state.wheelDate!==todayKey()?'🎁 Безкоштовне обертання':'🎡 Обертати · 2 500';
    }
    $('wheel-spin')?.addEventListener('click',spinWheel);
    document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.case)));
    if($('tab6')) $('tab6').addEventListener('click',()=>{});

  // ——— Init ———
    if (user) {
        els.userName.textContent = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
        if (user.photo_url) els.userPhoto.src = user.photo_url;
    } else {
        els.userName.textContent = 'Гість (відкрий у Telegram)';
    }

    processReferral();
    processPendingReferrals();

    $('tap-btn').addEventListener('click', onTap);

    document.querySelectorAll('.tablinks').forEach((btn) => {
        btn.addEventListener('click', () => openTab(btn.dataset.tab, btn));
    });

    els.closeBtn.addEventListener('click', closePanel);
    $('btn-shop').addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-tab="tab3"]');
        openTab('tab3', tabBtn);
    });
    $('btn-daily').addEventListener('click', claimDaily);
    $('btn-friends-quick').addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-tab="tab4"]');
        openTab('tab4', tabBtn);
    });

    $('btn-stats').addEventListener('click', () => {
        openTab('tab1', null);
    });

    $('btn-character').addEventListener('click', () => {
        openTab('tab5', null);
    });

    els.characterModalBuy.addEventListener('click', confirmBuyCharacter);
    els.characterModalCancel.addEventListener('click', closeCharacterModal);
    els.characterModalClose.addEventListener('click', closeCharacterModal);
    els.characterModal.querySelector('.character-modal-backdrop')?.addEventListener('click', closeCharacterModal);

    els.boostBtn?.addEventListener('click', activateBoost);

    $('copy-ref').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(getReferralLink());
            showToast('Посилання скопійовано!');
        } catch {
            els.referralLink.select();
            document.execCommand('copy');
            showToast('Посилання скопійовано!');
        }
    });

    $('share-ref').addEventListener('click', () => {
        const link = getReferralLink();
        const text = 'Грай у Vanya Coin Tapper разом зі мною! 🪙';
        if (telegram?.openTelegramLink) {
            telegram.openTelegramLink(
                `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
            );
        } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
        }
    });

    setInterval(() => {
        const now = Date.now();
        if (now - lastComboTapAt > 1200 && currentCombo !== 0) {
            currentCombo = 0;
            if (els.comboText) els.comboText.textContent = '🔥 Комбо: 0';
        }
        if (state.energy < state.maxEnergy) {
            state.energy = Math.min(state.maxEnergy, state.energy + state.energyRegen / 10);
        }
        const auto = getAutoIncome();
        if (auto > 0) {
            const tickIncome = auto / 10;
            state.balance += tickIncome;
            state.totalEarned += tickIncome;
        }
        if (now - lastAutosaveAt >= 1000) {
            state.lastSeenAt = now;
            persist();
            lastAutosaveAt = now;
        }
        updateUI();
    }, 100);

    renderUpgrades();
    renderTasks();
    renderCharacters();
    applyTapSkin();
    updateUI();
    if (load('_lastLevel', null) === null) save('_lastLevel', getLevelInfo().current.level);
    state.lastSeenAt = Date.now();
    persist();

})();
