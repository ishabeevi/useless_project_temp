/* ================================================
   BUNKVERSE — Meme Gallery Management Logic
   LocalStorage-based media assignment system
   ================================================ */

// ─── Category Definitions ─────────────────────────
const GALLERY_CATEGORIES = [
  {
    id: 'above90',
    icon: '😇',
    name: '90%+ Attendance',
    desc: 'Shown when user\'s attendance is above 90%',
    color: 'var(--green)',
  },
  {
    id: '80to89',
    icon: '😎',
    name: '80–89% Attendance',
    desc: 'Shown for 80–89% attendance range',
    color: 'var(--cyan)',
  },
  {
    id: '75to79',
    icon: '😬',
    name: '75–79% Attendance',
    desc: 'Shown for borderline 75–79% attendance',
    color: 'var(--gold)',
  },
  {
    id: 'below75',
    icon: '💀',
    name: 'Below 75% Attendance',
    desc: 'Shown when attendance drops below 75%',
    color: 'var(--red)',
  },
  {
    id: 'teacher_angry',
    icon: '😠',
    name: 'Teacher Angry',
    desc: 'Shown when teacher mood is Angry or Surprised',
    color: 'var(--red)',
  },
  {
    id: 'teacher_happy',
    icon: '🙂',
    name: 'Teacher Happy/Tired',
    desc: 'Shown when teacher is Happy or Tired',
    color: 'var(--green)',
  },
  {
    id: 'excuse',
    icon: '🤥',
    name: 'Excuse Generated',
    desc: 'Shown in the excuse suggestion page',
    color: 'var(--purple-light)',
  },
  {
    id: 'excuse_rejected',
    icon: '🚫',
    name: 'Excuse Rejected',
    desc: 'For low believability excuses',
    color: 'var(--red)',
  },
  {
    id: 'rank_up',
    icon: '🆙',
    name: 'Rank Up',
    desc: 'When user achieves a new rank',
    color: 'var(--gold)',
  },
  {
    id: 'legendary',
    icon: '☠️',
    name: 'Legendary Bunker',
    desc: 'For the most elite bunkers (below 60%)',
    color: 'var(--red)',
  },
];

// ─── State ────────────────────────────────────────
let currentCategory = null;
let pendingImage = null;
let pendingVideo = null;
let pendingDialogue = null;

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderOverview();
});

// ─── Render overview grid ─────────────────────────
function renderOverview() {
  const grid = document.getElementById('galleryOverview');
  grid.innerHTML = GALLERY_CATEGORIES.map(cat => {
    const saved = Storage.get(`gallery_${cat.id}`, {});
    return `
      <div class="gallery-overview-item ${currentCategory === cat.id ? 'active-cat' : ''}"
           id="overviewItem_${cat.id}"
           onclick="selectCategory('${cat.id}')">
        <span class="overview-icon">${cat.icon}</span>
        <div class="overview-name">${cat.name}</div>
        <div class="overview-status">
          <span class="assigned-dot ${saved.image ? 'has-image' : ''}" title="Image"></span>
          <span class="assigned-dot ${saved.video ? 'has-video' : ''}" title="Video"></span>
          <span class="assigned-dot ${saved.dialogue ? 'has-dialogue' : ''}" title="Dialogue"></span>
        </div>
      </div>`;
  }).join('');
}

// ─── Select category ──────────────────────────────
function selectCategory(catId) {
  // If unsaved changes, warn
  if (currentCategory && (pendingImage !== null || pendingVideo !== null || pendingDialogue !== null)) {
    if (!confirm('You have unsaved changes. Switch anyway?')) return;
  }

  currentCategory = catId;
  pendingImage = null;
  pendingVideo = null;
  pendingDialogue = null;

  const cat = GALLERY_CATEGORIES.find(c => c.id === catId);
  const saved = Storage.get(`gallery_${catId}`, {});

  // Update overview highlight
  document.querySelectorAll('.gallery-overview-item').forEach(el => el.classList.remove('active-cat'));
  const overviewItem = document.getElementById(`overviewItem_${catId}`);
  if (overviewItem) overviewItem.classList.add('active-cat');

  // Panel header
  document.getElementById('panelTitle').textContent = `📁 ${cat.name}`;
  document.getElementById('panelDesc').textContent = cat.desc;
  document.getElementById('noCategoryMsg').style.display = 'none';
  document.getElementById('assignmentArea').style.display = 'block';

  // Category info
  document.getElementById('catInfoIcon').textContent = cat.icon;
  document.getElementById('catInfoName').textContent = cat.name;
  document.getElementById('catInfoDesc').textContent = cat.desc;

  // Load existing
  loadSavedMedia(saved);
  updateDots(saved);

  document.getElementById('saveStatus').textContent = '';
  document.getElementById('assignmentArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Load saved media into preview ───────────────
function loadSavedMedia(saved) {
  // Image
  const imgPreview = document.getElementById('imagePreview');
  if (saved.image) {
    imgPreview.innerHTML = `<img src="${saved.image}" alt="Saved meme">`;
    document.getElementById('imageActions').style.display = 'flex';
  } else {
    imgPreview.innerHTML = '';
    document.getElementById('imageActions').style.display = 'none';
  }

  // Video
  const vidPreview = document.getElementById('videoPreview');
  if (saved.video) {
    vidPreview.innerHTML = `<video src="${saved.video}" controls></video>`;
    document.getElementById('videoActions').style.display = 'block';
  } else {
    vidPreview.innerHTML = '';
    document.getElementById('videoActions').style.display = 'none';
  }

  // Dialogue
  document.getElementById('catDialogueInput').value = saved.dialogue || '';
}

// ─── Update dot indicators ────────────────────────
function updateDots(saved) {
  document.getElementById('imageDot').className = `assigned-dot ${saved.image ? 'has-image' : ''}`;
  document.getElementById('videoDot').className = `assigned-dot ${saved.video ? 'has-video' : ''}`;
  document.getElementById('dialogueDot').className = `assigned-dot ${saved.dialogue ? 'has-dialogue' : ''}`;
}

// ─── Handle image upload ──────────────────────────
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large! Keep it under 5MB for best performance. 📦', 'error');
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    pendingImage = e.target.result;
    const imgPreview = document.getElementById('imagePreview');
    imgPreview.innerHTML = `<img src="${pendingImage}" alt="Preview">`;
    document.getElementById('imageActions').style.display = 'flex';
    document.getElementById('imageDot').className = 'assigned-dot has-image';
    document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes';
  };
  reader.readAsDataURL(file);
}

// ─── Handle video upload ──────────────────────────
function handleVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 15 * 1024 * 1024) {
    showToast('Video too large! Keep it under 15MB. Use compressed video. 🎬', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    pendingVideo = e.target.result;
    const vidPreview = document.getElementById('videoPreview');
    vidPreview.innerHTML = `<video src="${pendingVideo}" controls></video>`;
    document.getElementById('videoActions').style.display = 'block';
    document.getElementById('videoDot').className = 'assigned-dot has-video';
    document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes';
  };
  reader.readAsDataURL(file);
}

// ─── Handle dialogue input ────────────────────────
function handleDialogueInput() {
  pendingDialogue = document.getElementById('catDialogueInput').value;
  document.getElementById('dialogueDot').className = `assigned-dot ${pendingDialogue ? 'has-dialogue' : ''}`;
  document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes';
}

// ─── Save current category ────────────────────────
function saveCurrentCategory() {
  if (!currentCategory) { showToast('Select a category first! 📋', 'error'); return; }

  const saved = Storage.get(`gallery_${currentCategory}`, {});

  // Only update fields that have pending changes
  if (pendingImage !== null) saved.image = pendingImage;
  if (pendingVideo !== null) saved.video = pendingVideo;

  // Always save dialogue (could be empty = clearing)
  const dialogueVal = document.getElementById('catDialogueInput').value.trim();
  if (dialogueVal || pendingDialogue !== null) saved.dialogue = dialogueVal || null;

  Storage.set(`gallery_${currentCategory}`, saved);

  // Reset pending
  pendingImage = null;
  pendingVideo = null;
  pendingDialogue = null;

  renderOverview();
  updateDots(saved);

  document.getElementById('saveStatus').textContent = '✅ Saved!';
  setTimeout(() => { document.getElementById('saveStatus').textContent = ''; }, 2000);

  showToast(`Media saved for "${GALLERY_CATEGORIES.find(c=>c.id===currentCategory)?.name}"! 💾`, 'success');
}

// ─── Clear functions ──────────────────────────────
function clearImage() {
  pendingImage = null;
  if (currentCategory) {
    const saved = Storage.get(`gallery_${currentCategory}`, {});
    delete saved.image;
    Storage.set(`gallery_${currentCategory}`, saved);
    updateDots(saved);
  }
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('imageActions').style.display = 'none';
  document.getElementById('imageDot').className = 'assigned-dot';
  showToast('Image removed.', 'info');
}

function clearVideo() {
  pendingVideo = null;
  if (currentCategory) {
    const saved = Storage.get(`gallery_${currentCategory}`, {});
    delete saved.video;
    Storage.set(`gallery_${currentCategory}`, saved);
    updateDots(saved);
  }
  document.getElementById('videoPreview').innerHTML = '';
  document.getElementById('videoActions').style.display = 'none';
  document.getElementById('videoDot').className = 'assigned-dot';
  showToast('Video removed.', 'info');
}

function clearCategoryMedia() {
  if (!currentCategory) return;
  if (!confirm(`Clear ALL media for "${GALLERY_CATEGORIES.find(c=>c.id===currentCategory)?.name}"?`)) return;

  Storage.set(`gallery_${currentCategory}`, {});
  pendingImage = null;
  pendingVideo = null;
  pendingDialogue = null;

  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('videoPreview').innerHTML = '';
  document.getElementById('catDialogueInput').value = '';
  document.getElementById('imageActions').style.display = 'none';
  document.getElementById('videoActions').style.display = 'none';
  updateDots({});
  renderOverview();

  showToast('Category cleared.', 'info');
}

function clearAllMedia() {
  if (!confirm('Clear ALL media from ALL categories? This cannot be undone.')) return;
  GALLERY_CATEGORIES.forEach(cat => {
    localStorage.removeItem('bunkverse_gallery_' + cat.id);
  });
  renderOverview();
  if (currentCategory) {
    loadSavedMedia({});
    updateDots({});
  }
  showToast('All media cleared. Fresh start! 🔄', 'info');
}
