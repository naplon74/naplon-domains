let isRolling = false;
let hasResult = false;
const cooldownTurnsByName = new Map();

const startButton = document.getElementById('start-button');
const replayButton = document.getElementById('replay-button');
const settingsToggle = document.getElementById('settings-toggle');
const excludePanel = document.getElementById('exclude-panel');
const excludeInput = document.getElementById('exclude-input');
const loadingText = document.getElementById('loading-text');
const resultCard = document.getElementById('result-card');
const resultName = document.getElementById('result-name');
const resultComment = document.getElementById('result-comment');
const resultLink = document.getElementById('result-link');
const resultDifficulty = document.getElementById('result-difficulty');
const resultFamily = document.getElementById('result-family');
const resultImageWrap = document.getElementById('result-image-wrap');
const resultImage = document.getElementById('result-image');
const imageLightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const difficultyFilters = [...document.querySelectorAll('.difficulty-filter')];
const familyFilters = [...document.querySelectorAll('.family-filter')];

function closeImageLightbox() {
    imageLightbox.classList.add('hidden');
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';
    document.body.style.overflow = '';
}

function openImageLightbox() {
    if (!resultImage.getAttribute('src')) {
        return;
    }

    lightboxImage.src = resultImage.src;
    lightboxImage.alt = resultImage.alt || 'Distro preview';
    imageLightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateButtonState() {
    startButton.classList.toggle('hidden', isRolling || hasResult);
    replayButton.classList.toggle('hidden', !hasResult || isRolling);
    settingsToggle.classList.toggle('hidden', isRolling);
    startButton.disabled = isRolling;
    replayButton.disabled = isRolling;
}

function normalizeName(value) {
    return String(value).trim().toLowerCase();
}

function dedupeByName(distros) {
    const seen = new Set();

    return distros.filter((distro) => {
        const key = normalizeName(distro.name);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function getExcludedNames() {
    return excludeInput.value
        .split(',')
        .map((entry) => normalizeName(entry))
        .filter(Boolean);
}

function getSelectedDifficultyFilters() {
    return difficultyFilters
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => normalizeName(checkbox.value));
}

function getSelectedFamilyFilters() {
    return familyFilters
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => normalizeName(checkbox.value));
}

function normalizeFamilyValue(value) {
    const normalized = normalizeName(value);

    if (normalized === 'linux') return 'linux';
    if (['bsd', 'freebsd', 'openbsd', 'netbsd', 'dragonfly bsd', 'truenas scale', 'midnightbsd', 'ghostbsd'].includes(normalized)) {
        return 'bsd';
    }

    if (normalized === 'boredos' || normalized === 'other' || normalized === 'other systems' || normalized === 'other-systems') {
        return 'other';
    }

    return 'other';
}

function getDistroKey(distro) {
    return normalizeName(distro?.name);
}

function isDistroOnCooldown(distro) {
    const key = getDistroKey(distro);
    if (!key) {
        return false;
    }

    return (cooldownTurnsByName.get(key) || 0) > 0;
}

function tickCooldownTurns() {
    cooldownTurnsByName.forEach((turnsLeft, key) => {
        const nextTurns = turnsLeft - 1;

        if (nextTurns <= 0) {
            cooldownTurnsByName.delete(key);
            return;
        }

        cooldownTurnsByName.set(key, nextTurns);
    });
}

function assignWinnerCooldown(distro, poolSize) {
    const key = getDistroKey(distro);
    if (!key) {
        return;
    }

    const isSmallPool = Number(poolSize) < 10;
    const minTurns = 1;
    const maxTurns = isSmallPool ? 2 : 9;
    const cooldownTurns = Math.floor(Math.random() * (maxTurns - minTurns + 1)) + minTurns;
    cooldownTurnsByName.set(key, cooldownTurns);
}

function getAvailableDistros(distros) {
    const excludedNames = new Set(getExcludedNames());
    const excludedDifficulties = new Set(
        Object.keys({
            easy: 1,
            medium: 1,
            hard: 1
        }).filter((level) => !getSelectedDifficultyFilters().includes(level))
    );
    const excludedFamilies = new Set(
        ['linux', 'bsd', 'other'].filter((family) => !getSelectedFamilyFilters().includes(family))
    );

    return distros.filter((distro) => {
        const difficultyKey = normalizeName(distro.difficulty || getDifficultyForDistro(distro.name));
        const familyKey = normalizeFamilyValue(distro.family || getFamilyForDistro(distro.name));

        if (excludedNames.has(normalizeName(distro.name))) {
            return false;
        }

        if (excludedDifficulties.has(difficultyKey)) {
            return false;
        }

        if (excludedFamilies.has(familyKey)) {
            return false;
        }

        if (isDistroOnCooldown(distro)) {
            return false;
        }

        return true;
    });
}

function getDifficultyForDistro(distroName) {
    const difficultyMap = {
        ubuntu: 'easy',
        fedora: 'medium',
        'arch linux': 'hard',
        debian: 'easy',
        'linux mint': 'easy',
        opensuse: 'medium',
        manjaro: 'medium',
        'pop!_os': 'medium',
        'elementary os': 'easy',
        'zorin os': 'easy',
        'mx linux': 'easy',
        solus: 'medium',
        'void linux': 'hard',
        nixos: 'hard',
        'alpine linux': 'medium',
        gentoo: 'hard',
        slackware: 'hard',
        'centos stream': 'medium',
        'rocky linux': 'medium',
        almalinux: 'medium',
        'red hat enterprise linux': 'hard',
        'suse linux enterprise': 'hard',
        'oracle linux': 'medium',
        'kali linux': 'hard',
        'parrot os': 'hard',
        'blackarch linux': 'hard',
        tails: 'hard',
        'qubes os': 'hard',
        whonix: 'hard',
        deepin: 'medium',
        endeavouros: 'hard',
        'garuda linux': 'hard',
        cachyos: 'hard',
        'artix linux': 'hard',
        'puppy linux': 'easy',
        antix: 'easy',
        devuan: 'easy',
        pclinuxos: 'medium',
        mageia: 'medium',
        'raspberry pi os': 'easy',
        'amog-os': 'medium',
        'red star os': 'medium',
        'astra linux': 'medium',
        gendbuntu: 'easy',
        freebsd: 'easy',
        openbsd: 'hard',
        netbsd: 'medium',
        'dragonfly bsd': 'hard',
        'truenas scale': 'medium',
        'midnightbsd': 'medium',
        'ghostbsd': 'medium',
        'boredos': 'hard',
        'temple os': 'hard',
        'the bleed kernel': 'hard'
    };

    return difficultyMap[normalizeName(distroName)] || 'medium';
}

function getFamilyForDistro(distroName) {
    const familyMap = {
    ubuntu: 'linux',
    fedora: 'linux',
    'arch linux': 'linux',
    debian: 'linux',
    'linux mint': 'linux',
    opensuse: 'linux',
    manjaro: 'linux',
    'pop!_os': 'linux',
    'elementary os': 'linux',
    'zorin os': 'linux',
    'mx linux': 'linux',
    solus: 'linux',
    'void linux': 'linux',
    nixos: 'linux',
    'alpine linux': 'linux',
    gentoo: 'linux',
    slackware: 'linux',
    'centos stream': 'linux',
    'rocky linux': 'linux',
    almalinux: 'linux',
    'red hat enterprise linux': 'linux',
    'suse linux enterprise': 'linux',
    'oracle linux': 'linux',
    'kali linux': 'linux',
    'parrot os': 'linux',
    'blackarch linux': 'linux',
    tails: 'linux',
    'qubes os': 'linux',
    whonix: 'linux',
    deepin: 'linux',
    endeavouros: 'linux',
    'garuda linux': 'linux',
    cachyos: 'linux',
    'artix linux': 'linux',
    'puppy linux': 'linux',
    antix: 'linux',
    devuan: 'linux',
    pclinuxos: 'linux',
    mageia: 'linux',
    'raspberry pi os': 'linux',
    'amog-os': 'linux',
    'red star os': 'linux',
    'astra linux': 'linux',
    gendbuntu: 'linux',
    freebsd: 'bsd',
    openbsd: 'bsd',
    netbsd: 'bsd',
    'dragonfly bsd': 'bsd',
    'truenas scale': 'bsd',
    'midnightbsd': 'bsd',
    'ghostbsd': 'bsd',
    boredos: 'boredos',
    'temple os': 'bsd',
    'the bleed kernel': 'other'
    };

    return familyMap[normalizeName(distroName)] || 'linux';
}

settingsToggle.addEventListener('click', () => {
    excludePanel.classList.toggle('hidden');
});

resultImage.addEventListener('click', openImageLightbox);

imageLightbox.addEventListener('click', closeImageLightbox);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !imageLightbox.classList.contains('hidden')) {
        closeImageLightbox();
    }
});

excludeInput.addEventListener('input', () => {
    if (excludeInput.value.trim()) {
        loadingText.textContent = 'Exclusion list updated.';
        return;
    }

    loadingText.textContent = 'Press start to spin.';
});

async function roll() {
    if (isRolling) {
        return;
    }

    closeImageLightbox();

    isRolling = true;
    hasResult = false;
    updateButtonState();

    resultCard.classList.remove('show');
    resultName.textContent = '';
    resultComment.textContent = '';
    resultLink.textContent = '';
    resultLink.removeAttribute('href');
    resultDifficulty.textContent = '';
    resultDifficulty.className = 'difficulty-badge';
    resultFamily.textContent = '';
    resultFamily.className = 'family-badge';
    resultImage.removeAttribute('src');
    resultImage.alt = '';
    resultImageWrap.classList.add('hidden');

    try {
        const response = await fetch('os.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Could not load os.json');
        }

        const distros = await response.json();
        const uniqueDistros = dedupeByName(Array.isArray(distros) ? distros : []);

        if (!uniqueDistros.length) {
            throw new Error('No distro data found');
        }

        const availableDistros = getAvailableDistros(uniqueDistros);
        if (!availableDistros.length) {
            throw new Error('No distros left after your exclusions.');
        }

        const spinDurationMs = 2600;
        const stepMs = 100;

        const spinner = setInterval(() => {
            const randomDistro = availableDistros[Math.floor(Math.random() * availableDistros.length)];
            loadingText.textContent = `Loading... ${randomDistro.name}`;
        }, stepMs);

        await new Promise((resolve) => setTimeout(resolve, spinDurationMs));
        clearInterval(spinner);

        const winner = availableDistros[Math.floor(Math.random() * availableDistros.length)];
        loadingText.textContent = `Selected: ${winner.name}`;

        // Consume one turn for current cooldown entries, then lock the new winner.
        tickCooldownTurns();
        assignWinnerCooldown(winner, availableDistros.length);

        const difficultyMap = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        };

        const familyMap = {
            linux: 'Linux',
            bsd: 'BSD',
            boredos: 'BoredOS',
            other: 'Other systems'
        };

        const difficultyKey = normalizeName(winner.difficulty || getDifficultyForDistro(winner.name));
        const difficultyLabel = difficultyMap[difficultyKey] || 'Medium';
        const familyKey = normalizeFamilyValue(winner.family || getFamilyForDistro(winner.name));
        const familyLabel = familyMap[familyKey] || 'Linux';

        resultName.textContent = winner.name;
        resultDifficulty.textContent = difficultyLabel;
        resultDifficulty.className = `difficulty-badge difficulty-${difficultyKey}`;
        resultFamily.textContent = familyLabel;
        resultFamily.className = `family-badge family-${familyKey}`;

        if (typeof winner.image === 'string' && winner.image.trim()) {
            resultImage.src = winner.image.trim();
            resultImage.alt = `${winner.name} preview`;
            resultImageWrap.classList.remove('hidden');
        }

        resultComment.textContent = winner.comment;
        resultLink.textContent = 'Official website';
        resultLink.href = winner.link;
        resultCard.classList.add('show');

        hasResult = true;
    } catch (error) {
        loadingText.textContent = error.message || 'Failed to load distro data. Check os.json.';
        hasResult = false;
    } finally {
        isRolling = false;
        updateButtonState();
    }
}

updateButtonState();
window.roll = roll;