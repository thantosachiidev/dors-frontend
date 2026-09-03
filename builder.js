const componentTemplates = {
  header: {
    type: 'header',
    label: 'Header',
    props: {
      title: 'North Studio',
      nav: ['Work', 'About', 'Shop'],
      background: '#ffffff',
      padding: 22,
    },
    render: (item) => `
      <header class="site-header-demo" data-id="${item.id}">
        <div class="demo-brand">${item.props.title}</div>
        <nav class="demo-nav">
          ${item.props.nav.map((link) => `<span>${link}</span>`).join('')}
        </nav>
      </header>
    `,
  },
  text: {
    type: 'text',
    label: 'Text',
    props: {
      heading: 'Portfolio pieces with clarity and depth.',
      body: 'Thoughtful systems for brands, products, and spaces that need to feel considered.',
      align: 'left',
      color: '#1f2a37',
    },
    render: (item) => `
      <section class="builder-text" data-id="${item.id}">
        <p class="demo-kicker">Selected work</p>
        <h2>${item.props.heading}</h2>
        <p>${item.props.body}</p>
      </section>
    `,
  },
  image: {
    type: 'image',
    label: 'Image',
    props: {
      src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
      alt: 'Portfolio feature image',
      height: 250,
      fit: 'cover',
    },
    render: (item) => `
      <div class="builder-image-wrap" data-id="${item.id}">
        <img
          src="${item.props.src}"
          alt="${item.props.alt}"
          style="height: ${item.props.height}px; object-fit: ${item.props.fit};"
        />
      </div>
    `,
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    props: {
      columns: 3,
      items: ['#1f2a37', '#f4f1ec', '#c4622d'],
    },
    render: (item) => `
      <section class="grid-demo" data-id="${item.id}">
        ${item.props.items.map((color) => `<div class="mini-card" style="background: linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.25) 100%);"></div>`).join('')}
      </section>
    `,
  },
  callout: {
    type: 'callout',
    label: 'Callout',
    props: {
      eyebrow: 'Studio note',
      title: 'Design systems that feel considered.',
      button: 'Book a project',
      background: '#f4f1ec',
    },
    render: (item) => `
      <section class="builder-callout" data-id="${item.id}" style="background: ${item.props.background};">
        <p class="demo-kicker">${item.props.eyebrow}</p>
        <h3>${item.props.title}</h3>
        <button class="cta-button" type="button">${item.props.button}</button>
      </section>
    `,
  },
};

const initialState = [
  {
    id: crypto.randomUUID(),
    type: 'header',
    props: {
      title: 'North Studio',
      nav: ['Work', 'About', 'Shop'],
      background: '#ffffff',
      padding: 22,
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'text',
    props: {
      heading: 'Portfolio pieces with clarity and depth.',
      body: 'Thoughtful systems for brands, products, and spaces that need to feel considered.',
      align: 'left',
      color: '#1f2a37',
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'gallery',
    props: {
      columns: 3,
      items: ['#1f2a37', '#f4f1ec', '#c4622d'],
    },
  },
];

const state = {
  items: [...initialState],
  selectedId: initialState[0]?.id ?? null,
  siteId: new URLSearchParams(window.location.search).get('siteId') || localStorage.getItem('dors_active_portfolio_site_id'),
  isDirty: true,
};

const API_BASE_URL = window.__DORS_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3001`;
const canvasRoot = document.getElementById('canvas-root');
const propertiesPanel = document.getElementById('properties-panel');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const previewButton = document.getElementById('preview-button');
const saveButton = document.getElementById('save-button');
const publishButton = document.getElementById('publish-button');
const saveStatus = document.getElementById('save-status');
const publishToast = document.getElementById('publish-toast');
const history = {
  past: [],
  future: [],
  limit: 50,
};

function setSaveStatus(label, stateName = '') {
  if (!saveStatus) return;
  saveStatus.textContent = label;
  saveStatus.className = `save-status ${stateName}`;
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('dors_session') || 'null');
  } catch (error) {
    return null;
  }
}

function serializeLayout() {
  return {
    version: 1,
    blocks: state.items.map((item) => ({
      id: item.id,
      type: item.type,
      props: structuredClone(item.props),
    })),
  };
}

async function saveLayout() {
  if (!state.isDirty) return;

  const session = getSession();
  if (!session?.token) {
    setSaveStatus('Sign in to save', 'saving');
    return;
  }

  setSaveStatus('Saving...', 'saving');
  if (saveButton) saveButton.disabled = true;

  try {
    const payload = {
      layout_data: serializeLayout(),
    };
    let response;

    if (state.siteId) {
      response = await fetch(`${API_BASE_URL}/api/portfolio-sites/${state.siteId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(`${API_BASE_URL}/api/portfolio-sites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'North Studio',
          slug: `north-studio-${Date.now()}`,
          layout_data: payload.layout_data,
        }),
      });
    }

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.errors?.[0] || 'Could not save your portfolio.');
    }

    state.siteId = result.data.id;
    state.isDirty = false;
    localStorage.setItem('dors_active_portfolio_site_id', state.siteId);
    setSaveStatus('Saved', 'saved');
    return result.data;
  } catch (error) {
    setSaveStatus('Save failed', 'saving');
    console.error('Portfolio save failed:', error);
    return null;
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

function renderPreviewDocument() {
  const blocks = state.items.map((item) => componentTemplates[item.type].render(item)).join('');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>North Studio</title><style>
    *{box-sizing:border-box}body{max-width:960px;margin:0 auto;padding:32px 20px;background:#fff;color:#1f2a37;font-family:Arial,sans-serif;min-height:100vh}.site-header-demo{display:flex;justify-content:space-between;gap:24px;padding:12px 0 24px;border-bottom:1px solid #d9d4ce}.demo-nav{display:flex;gap:20px;color:#3d4451}.builder-text{padding:72px 0 40px;max-width:650px}.demo-kicker{color:#c4622d;text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:bold}.builder-text h2,.builder-callout h3{font-size:clamp(40px,7vw,72px);line-height:1;margin:16px 0}.builder-text p,.builder-callout p{color:#3d4451;line-height:1.7}.builder-image-wrap img{width:100%;max-height:560px;object-fit:cover;border-radius:18px}.grid-demo{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:32px 0}.mini-card{height:180px;border-radius:14px}.builder-callout{padding:28px;border-radius:18px;margin-top:24px}.cta-button{padding:12px 16px;border:0;border-radius:8px;background:#1f2a37;color:#fff;font-weight:bold}@media(max-width:600px){.site-header-demo{align-items:flex-start;flex-direction:column}.grid-demo{grid-template-columns:1fr 1fr}}
  </style></head><body>${blocks}</body></html>`;
}

function openPreview() {
  const previewWindow = window.open('', '_blank');
  if (!previewWindow) {
    setSaveStatus('Allow pop-ups to preview', 'saving');
    return;
  }

  previewWindow.document.write(renderPreviewDocument());
  previewWindow.document.close();
}

function showPublishToast(publicUrl) {
  if (!publishToast) return;
  publishToast.innerHTML = `<strong>Published. Your portfolio is live.</strong><a href="${publicUrl}" target="_blank" rel="noreferrer">${publicUrl}</a>`;
  publishToast.classList.add('is-visible');
  window.setTimeout(() => publishToast.classList.remove('is-visible'), 7000);
}

async function publishLayout() {
  const savedSite = await saveLayout();
  if (!savedSite?.id) return;

  const session = getSession();
  if (!session?.token) return;
  if (publishButton) publishButton.disabled = true;
  setSaveStatus('Publishing...', 'saving');

  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio-sites/${savedSite.id}/publish`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.errors?.[0] || 'Could not publish your portfolio.');
    }

    state.isDirty = false;
    setSaveStatus('Published', 'saved');
    showPublishToast(result.data.public_url);
  } catch (error) {
    setSaveStatus('Publish failed', 'saving');
    console.error('Portfolio publish failed:', error);
  } finally {
    if (publishButton) publishButton.disabled = false;
  }
}

function markDirty() {
  state.isDirty = true;
  setSaveStatus('Unsaved changes');
}

function cloneItems(items) {
  return structuredClone(items);
}

function createHistoryEntry() {
  return {
    items: cloneItems(state.items),
    selectedId: state.selectedId,
  };
}

function recordHistory() {
  history.past.push(createHistoryEntry());
  if (history.past.length > history.limit) history.past.shift();
  history.future = [];
}

function restoreHistoryEntry(entry) {
  state.items = cloneItems(entry.items);
  state.selectedId = entry.selectedId && state.items.some((item) => item.id === entry.selectedId)
    ? entry.selectedId
    : state.items[0]?.id || null;
  markDirty();
  render();
}

function updateHistoryButtons() {
  if (undoButton) undoButton.disabled = history.past.length === 0;
  if (redoButton) redoButton.disabled = history.future.length === 0;
}

function undo() {
  const previous = history.past.pop();
  if (!previous) return;

  history.future.push(createHistoryEntry());
  restoreHistoryEntry(previous);
}

function redo() {
  const next = history.future.pop();
  if (!next) return;

  history.past.push(createHistoryEntry());
  restoreHistoryEntry(next);
}

function createComponent(type) {
  const template = componentTemplates[type];
  if (!template) return null;

  const item = {
    id: crypto.randomUUID(),
    type,
    props: structuredClone(template.props),
  };

  recordHistory();
  state.items.push(item);
  state.selectedId = item.id;
  markDirty();
  render();
  return item;
}

function getSelectedItem() {
  return state.items.find((item) => item.id === state.selectedId) || null;
}

function renderPropertyPanel() {
  const selectedItem = getSelectedItem();

  if (!selectedItem) {
    propertiesPanel.innerHTML = `
      <div class="panel-header">
        <p>Properties</p>
      </div>
      <div class="property-group">
        <label>Select a section</label>
        <p class="empty-properties">Click a block on the canvas to edit its content.</p>
      </div>
    `;
    return;
  }

  const { type, props } = selectedItem;

  let controls = '';

  if (type === 'header') {
    controls = `
      <div class="property-group">
        <label>Brand name</label>
        <input data-prop="title" type="text" value="${props.title}" />
      </div>
      <div class="property-group">
        <label>Navigation</label>
        <textarea data-prop="nav">${props.nav.join('\n')}</textarea>
      </div>
    `;
  }

  if (type === 'text') {
    controls = `
      <div class="property-group">
        <label>Heading</label>
        <input data-prop="heading" type="text" value="${props.heading}" />
      </div>
      <div class="property-group">
        <label>Body</label>
        <textarea data-prop="body">${props.body}</textarea>
      </div>
    `;
  }

  if (type === 'image') {
    controls = `
      <div class="property-group">
        <label>Image URL</label>
        <input data-prop="src" type="text" value="${props.src}" />
      </div>
      <div class="property-group">
        <label>Alt text</label>
        <input data-prop="alt" type="text" value="${props.alt}" />
      </div>
    `;
  }

  if (type === 'gallery') {
    controls = `
      <div class="property-group">
        <label>Colors</label>
        <textarea data-prop="items">${props.items.join('\n')}</textarea>
      </div>
    `;
  }

  if (type === 'callout') {
    controls = `
      <div class="property-group">
        <label>Eyebrow</label>
        <input data-prop="eyebrow" type="text" value="${props.eyebrow}" />
      </div>
      <div class="property-group">
        <label>Title</label>
        <input data-prop="title" type="text" value="${props.title}" />
      </div>
      <div class="property-group">
        <label>Button label</label>
        <input data-prop="button" type="text" value="${props.button}" />
      </div>
    `;
  }

  propertiesPanel.innerHTML = `
    <div class="panel-header">
      <p>Properties</p>
    </div>
    ${controls}
    <div class="property-group">
      <label>Actions</label>
      <button class="secondary-button" type="button" data-action="duplicate">Duplicate section</button>
      <button class="secondary-button" type="button" data-action="delete">Delete</button>
    </div>
  `;

  propertiesPanel.querySelectorAll('[data-prop]').forEach((field) => {
    field.addEventListener('input', (event) => {
      const propName = event.target.dataset.prop;
      const value = event.target.value;

      recordHistory();
      if (propName === 'nav' || propName === 'items') {
        selectedItem.props[propName] = value
          .split(/\n|,/) 
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        selectedItem.props[propName] = value;
      }

      markDirty();
      renderCanvas();
      updateHistoryButtons();
    });
  });

  propertiesPanel.querySelector('[data-action="duplicate"]')?.addEventListener('click', () => {
    const clone = JSON.parse(JSON.stringify(selectedItem));
    clone.id = crypto.randomUUID();
    recordHistory();
    state.items.splice(state.items.indexOf(selectedItem) + 1, 0, clone);
    state.selectedId = clone.id;
    markDirty();
    render();
  });

  propertiesPanel.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
    const index = state.items.findIndex((item) => item.id === selectedItem.id);
    if (index === -1) return;

    recordHistory();
    state.items.splice(index, 1);
    state.selectedId = state.items[index]?.id || state.items[index - 1]?.id || null;
    markDirty();
    render();
  });
}

function renderCanvas() {
  canvasRoot.innerHTML = '';

  state.items.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = `canvas-item ${item.id === state.selectedId ? 'is-selected' : ''}`;
    wrapper.dataset.id = item.id;
    wrapper.tabIndex = 0;
    wrapper.innerHTML = componentTemplates[item.type].render(item);

    wrapper.addEventListener('click', (event) => {
      event.stopPropagation();
      state.selectedId = item.id;
      render();
    });

    canvasRoot.appendChild(wrapper);
  });

  if (!state.items.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-canvas';
    emptyState.innerHTML = '<p>Drop a component here to begin building your portfolio.</p>';
    canvasRoot.appendChild(emptyState);
  }
}

function render() {
  renderCanvas();
  renderPropertyPanel();
  updateHistoryButtons();
}

function wireDragAndDrop() {
  document.querySelectorAll('[data-component-type]').forEach((component) => {
    component.addEventListener('dragstart', (event) => {
      const type = event.currentTarget.dataset.componentType;
      event.dataTransfer.setData('text/plain', type);
      event.dataTransfer.effectAllowed = 'copy';
    });
  });

  canvasRoot.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  canvasRoot.addEventListener('drop', (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type) return;

    const rect = canvasRoot.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0) return;

    createComponent(type);
  });

  canvasRoot.addEventListener('click', (event) => {
    if (event.target === canvasRoot) {
      state.selectedId = null;
      render();
    }
  });
}

undoButton?.addEventListener('click', undo);
redoButton?.addEventListener('click', redo);
previewButton?.addEventListener('click', openPreview);
saveButton?.addEventListener('click', saveLayout);
publishButton?.addEventListener('click', publishLayout);
window.setInterval(saveLayout, 30 * 1000);

wireDragAndDrop();
render();
