// Server API Configuration
const AUTH_API = 'http://localhost:4000';
const BLOG_API = 'http://localhost:5000/api';

// Application State
let currentUser = null;
let currentToken = localStorage.getItem('accessToken') || null;
let currentRefreshToken = localStorage.getItem('refreshToken') || null;
let isRegisterMode = false;

// DOM Elements
const navActions = document.getElementById('nav-actions');
const authSection = document.getElementById('auth-section');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const roleGroup = document.getElementById('role-group');
const roleSelect = document.getElementById('role');
const authSubmitBtn = document.getElementById('auth-submit-btn');

const editorSection = document.getElementById('editor-section');
const editorTitle = document.getElementById('editor-title');
const postForm = document.getElementById('post-form');
const editPostIdInput = document.getElementById('edit-post-id');
const postTitleInput = document.getElementById('post-title-input');
const postContentInput = document.getElementById('post-content-input');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const postsContainer = document.getElementById('posts-container');
const statusMessage = document.getElementById('status-message');
const btnAllPosts = document.getElementById('btn-all-posts');
const btnMyPosts = document.getElementById('btn-my-posts');

// Helper: Decode JWT Token to get User Info
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

// Initialize Application state on startup
function init() {
  if (currentToken) {
    currentUser = parseJwt(currentToken);
    // If token expired or invalid, clear state
    if (!currentUser || (currentUser.exp && currentUser.exp * 1000 < Date.now())) {
      logout();
      return;
    }
  }
  renderNav();
  fetchPosts();
}

// Display Alerts/Notifications
function showMessage(msg, type = 'error') {
  statusMessage.className = `alert alert-${type}`;
  statusMessage.textContent = msg;
  statusMessage.classList.remove('hidden');
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 4000);
}

// Render Top Navigation Bar Buttons Dynamically
function renderNav() {
  navActions.innerHTML = '';

  if (currentUser) {
    // Show logged-in user details & actions
    const userBadge = document.createElement('span');
    userBadge.style.marginRight = '0.5rem';
    userBadge.style.fontSize = '0.9rem';
    userBadge.innerHTML = `🧙‍♂️ <strong>${currentUser.username}</strong> <span class="badge-role">${currentUser.role}</span>`;

    // Show Create Post button if Author or Admin
    if (currentUser.role === 'author' || currentUser.role === 'admin') {
      const createBtn = document.createElement('button');
      createBtn.className = 'btn btn-gold';
      createBtn.textContent = '+ Write Entry';
      createBtn.onclick = () => {
        resetPostForm();
        editorSection.classList.toggle('hidden');
      };
      navActions.appendChild(createBtn);
    }

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.style.color = '#ffffff';
    logoutBtn.style.borderColor = '#ffffff';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = logout;

    navActions.appendChild(userBadge);
    navActions.appendChild(logoutBtn);
    btnMyPosts.classList.remove('hidden');
  } else {
    // Show Login & Register Buttons
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn btn-gold';
    loginBtn.textContent = 'Log In';
    loginBtn.onclick = () => showAuthModal(false);

    const registerBtn = document.createElement('button');
    registerBtn.className = 'btn btn-outline';
    registerBtn.style.color = '#ffffff';
    registerBtn.style.borderColor = '#ffffff';
    registerBtn.textContent = 'Register';
    registerBtn.onclick = () => showAuthModal(true);

    navActions.appendChild(loginBtn);
    navActions.appendChild(registerBtn);
    btnMyPosts.classList.add('hidden');
  }
}

// Toggle Auth Form (Login vs Register Mode)
function showAuthModal(registerMode = false) {
  isRegisterMode = registerMode;
  authSection.classList.remove('hidden');
  if (isRegisterMode) {
    authTitle.textContent = 'Join the Great Hall (Register)';
    roleGroup.classList.remove('hidden');
    authSubmitBtn.textContent = 'Register Account';
  } else {
    authTitle.textContent = 'Welcome to the Archives (Login)';
    roleGroup.classList.add('hidden');
    authSubmitBtn.textContent = 'Log In';
  }
}

// Authentication Form Submit Handler
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleSelect.value;

  const endpoint = isRegisterMode ? `${AUTH_API}/register` : `${AUTH_API}/login`;
  const payload = isRegisterMode ? { username, password, role } : { username, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    if (isRegisterMode) {
      showMessage('Registration successful! Please log in.', 'success');
      showAuthModal(false);
    } else {
      currentToken = data.accessToken;
      currentRefreshToken = data.refreshToken;
      localStorage.setItem('accessToken', currentToken);
      localStorage.setItem('refreshToken', currentRefreshToken);
      currentUser = parseJwt(currentToken);

      authSection.classList.add('hidden');
      authForm.reset();
      showMessage(`Welcome back, ${currentUser.username}!`, 'success');
      renderNav();
      fetchPosts();
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// Logout Handler
async function logout() {
  if (currentRefreshToken) {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      });
    } catch (e) {
      console.error('Logout error', e);
    }
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  currentToken = null;
  currentRefreshToken = null;
  currentUser = null;

  editorSection.classList.add('hidden');
  renderNav();
  fetchPosts();
  showMessage('Logged out successfully', 'success');
}

// Fetch All Posts
async function fetchPosts() {
  try {
    const res = await fetch(`${BLOG_API}/posts`);
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    showMessage('Failed to load posts', 'error');
  }
}

// Fetch Logged-In User's Posts ("My Posts")
async function fetchMyPosts() {
  if (!currentToken) return;
  try {
    const res = await fetch(`${BLOG_API}/me/posts`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    showMessage('Failed to load your posts', 'error');
  }
}

// Render Posts List to DOM
function renderPosts(posts) {
  postsContainer.innerHTML = '';

  if (!Array.isArray(posts) || posts.length === 0) {
    postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No posts found in the archives.</p>';
    return;
  }

  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'post-card';

    const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.id === post.user_id || currentUser.username === post.author);
    const canDelete = currentUser && currentUser.role === 'admin';

    card.innerHTML = `
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <div class="post-meta">
        <span>By <strong>${escapeHtml(post.author || 'Wizard')}</strong></span>
      </div>
      <div class="post-content">${escapeHtml(post.content || '')}</div>
      ${(canEdit || canDelete) ? `
        <div class="post-actions">
          ${canEdit ? `<button class="btn btn-outline" onclick="startEditPost('${post.id}', \`${escapeHtml(post.title)}\`, \`${escapeHtml(post.content || '')}\`)">Edit</button>` : ''}
          ${canDelete ? `<button class="btn btn-danger" onclick="deletePost('${post.id}')">Delete</button>` : ''}
        </div>
      ` : ''}
    `;

    postsContainer.appendChild(card);
  });
}

// Handle Post Creation and Updating
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editPostIdInput.value;
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();

  const isEdit = Boolean(id);
  const endpoint = isEdit ? `${BLOG_API}/posts/${id}` : `${BLOG_API}/posts`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ title, content })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to save post');
    }

    showMessage(isEdit ? 'Post updated!' : 'Post published!', 'success');
    resetPostForm();
    editorSection.classList.add('hidden');
    fetchPosts();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// Prepare Editor Form for Editing a Post
window.startEditPost = function(id, title, content) {
  editPostIdInput.value = id;
  postTitleInput.value = title;
  postContentInput.value = content;
  editorTitle.textContent = 'Edit Quill Entry';
  cancelEditBtn.classList.remove('hidden');
  editorSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Reset Post Form
function resetPostForm() {
  editPostIdInput.value = '';
  postForm.reset();
  editorTitle.textContent = 'Compose Quill Entry';
  cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.onclick = () => {
  resetPostForm();
  editorSection.classList.add('hidden');
};

// Delete Post Handler
window.deletePost = async function(id) {
  if (!confirm('Are you sure you want to banish this post?')) return;

  try {
    const res = await fetch(`${BLOG_API}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete post');
    }

    showMessage('Post deleted!', 'success');
    fetchPosts();
  } catch (err) {
    showMessage(err.message, 'error');
  }
};

// Utility function to prevent XSS Attacks
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Navigation Filter Listeners
btnAllPosts.onclick = fetchPosts;
btnMyPosts.onclick = fetchMyPosts;

// Initialize on page load
init();