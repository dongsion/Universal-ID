/* ========================================
   Universal ID - Snacks Store
   完整版：含商品管理（增删改查）+ 库存管理 + localStorage 持久化
   ======================================== */

/* ---- 默认商品数据 ---- */
const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Smiths Chips',   brand: 'Smiths',      price: 7,  stock: 50,  bg: '#FFF3D6', bagBg: '#E8650C', bagText: 'SMITHS',     bagSub: 'Original',    cat: 'Chips',  image: null },
  { id: 2, name: 'Coconut Chips',  brand: 'Dang',        price: 6,  stock: 80,  bg: '#D6F5E0', bagBg: '#1A8A4E', bagText: 'dang',        bagSub: 'Coconut',     cat: 'Chips',  image: null },
  { id: 3, name: 'Dark Russet',    brand: 'Idaho',       price: 8,  stock: 30,  bg: '#F5D6E0', bagBg: '#2A2A2A', bagText: 'IDAHO',       bagSub: 'Dark Russet', cat: 'Chips',  image: null },
  { id: 4, name: 'Regular Nature', brand: 'Ruffles',     price: 8,  stock: 60,  bg: '#D6E8F5', bagBg: '#1A5B9E', bagText: 'RUFFLES',     bagSub: 'Original',    cat: 'Chips',  image: null },
  { id: 5, name: 'Twister Chips',  brand: 'Twistos',     price: 6,  stock: 0,   bg: '#F5D6D6', bagBg: '#C01A1A', bagText: 'TWISTOS',     bagSub: 'BBQ',         cat: 'Chips',  image: null },
  { id: 6, name: 'Deep River',     brand: 'Deep River',  price: 9,  stock: 25,  bg: '#E0D6F5', bagBg: '#5B1A8A', bagText: 'DEEP RIVER',  bagSub: 'Sea Salt',    cat: 'Chips',  image: null },
  { id: 7, name: 'Unreal Muffins', brand: 'Unreal',      price: 6,  stock: 40,  bg: '#D6F5E8', bagBg: '#1A8A6E', bagText: 'UNREAL',      bagSub: 'Cocoa',       cat: 'Choco',  image: null },
  { id: 8, name: 'Perfect Snacks', brand: 'Perfect',     price: 8,  stock: 35,  bg: '#F5E8D6', bagBg: '#5B3A1A', bagText: 'PERFECT',     bagSub: 'Dark Choc',   cat: 'Choco',  image: null },
];

/* ---- 状态 ---- */
let products = [];
let cart = [];
let currentDetailProduct = null;
let currentQty = 1;
let editingProductId = null;
let uploadedImage = null;
let selectedColor = '#FFF3D6';
let currentFilter = 'All';

/* ---- localStorage 持久化 ---- */
const STORAGE_KEY = 'universal_id_products';
const CART_KEY = 'universal_id_cart';

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      products = JSON.parse(saved);
    } catch (e) {
      products = [...DEFAULT_PRODUCTS];
    }
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadCart() {
  const saved = localStorage.getItem(CART_KEY);
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getNextId() {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/* ---- DOM 引用 ---- */
const app = document.getElementById('app');
const productGrid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');
const itemCount = document.getElementById('item-count');
const collectionTitle = document.getElementById('collection-title');
const cartBar = document.getElementById('cart-bar');
const cartBarBadge = document.getElementById('cart-bar-badge');
const cartBarSub = document.getElementById('cart-bar-sub');
const cartBarThumbs = document.getElementById('cart-bar-thumbs');
const flyClone = document.getElementById('fly-clone');
const pageBrowse = document.getElementById('page-browse');
const pageDetail = document.getElementById('page-detail');
const pageCart = document.getElementById('page-cart');
const detailContent = document.getElementById('detail-content');
const qtyNumber = document.getElementById('qty-number');
const detailPrice = document.getElementById('detail-price');
const detailAddBtn = document.getElementById('detail-add-btn');
const cartBadgeTop = document.getElementById('cart-badge-top');
const cartBody = document.getElementById('cart-body');
const toast = document.getElementById('toast');

/* 管理面板 DOM */
const manageOverlay = document.getElementById('manage-overlay');
const manageList = document.getElementById('manage-list');
const manageCount = document.getElementById('manage-count');
const manageFormSection = document.getElementById('manage-form-section');
const formTitle = document.getElementById('form-title');
const imageInput = document.getElementById('image-input');
const uploadPreview = document.getElementById('upload-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const formName = document.getElementById('form-name');
const formBrand = document.getElementById('form-brand');
const formPrice = document.getElementById('form-price');
const formStock = document.getElementById('form-stock');
const formCategory = document.getElementById('form-category');
const colorPicker = document.getElementById('color-picker');
const formSaveBtn = document.getElementById('form-save-btn');

/* ========================================
   生成商品图 HTML（支持上传图片或 CSS 包装袋）
   ======================================== */
function productImageHTML(product) {
  if (product.image) {
    return `<img src="${product.image}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`;
  }
  return `<div class="bag" style="background:${product.bagBg || '#666'}">
    <span class="bag-brand">${product.bagText || product.brand || ''}</span>
    <span class="bag-flavor">${product.bagSub || product.cat || ''}</span>
  </div>`;
}

function thumbImageHTML(product) {
  if (product.image) {
    return `<img src="${product.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  }
  return `<div class="cart-thumb-mini-bag bag" style="background:${product.bagBg || '#666'}">
    <span class="bag-brand" style="font-size:5px">${product.bagText || ''}</span>
  </div>`;
}

/* ========================================
   渲染产品网格
   ======================================== */
function renderProductGrid() {
  const filtered = currentFilter === 'All'
    ? products
    : products.filter(p => p.cat === currentFilter);

  itemCount.textContent = `${filtered.length} items`;
  collectionTitle.textContent = currentFilter === 'All'
    ? 'All Collections'
    : `${currentFilter} Collections`;

  if (filtered.length === 0) {
    productGrid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  productGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  productGrid.innerHTML = filtered.map(p => {
    const soldOut = p.stock <= 0;
    const lowStock = p.stock > 0 && p.stock <= 10;
    return `
      <div class="product-card ${soldOut ? 'sold-out' : ''}" data-id="${p.id}" onclick="openDetail(${p.id})">
        <div class="card-bg" style="background:${p.bg || '#f0f0f3'}"></div>
        ${soldOut ? '<div class="sold-out-tag">SOLD OUT</div>' : ''}
        ${!soldOut ? `<div class="card-stock ${lowStock ? 'low' : ''}">${p.stock} left</div>` : ''}
        <span class="product-name">${p.name}</span>
        <div class="product-image">${productImageHTML(p)}</div>
        <div class="card-bottom">
          <span class="card-price">$${String(p.price).padStart(2, '0')}.00</span>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id}, this)" ${soldOut ? 'disabled' : ''}>
            <svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* ========================================
   打开详情页
   ======================================== */
function openDetail(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  currentDetailProduct = product;
  currentQty = 1;

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  detailContent.innerHTML = `
    <div class="detail-product-name">${product.name}</div>
    <div class="detail-brand">${product.brand || ''}</div>
    <div class="detail-image-wrap">
      <div class="detail-image-bg" style="background:${product.bagBg || product.bg || '#ccc'}"></div>
      <div class="detail-image">${productImageHTML(product)}</div>
    </div>
    <div class="detail-tags">
      <div class="detail-tag">🌿</div>
      <div class="detail-tag">⚡</div>
      <div class="detail-tag">✓</div>
    </div>
    <div class="detail-info">
      <span class="detail-info-pill">${product.cat || 'Snacks'}</span>
      <span class="detail-info-pill">Premium</span>
      <span class="detail-info-pill">Natural</span>
    </div>
    <div class="detail-stock ${soldOut ? 'out' : lowStock ? 'low' : ''}">
      <div class="stock-dot"></div>
      <span>${soldOut ? 'Out of stock' : lowStock ? `Only ${product.stock} left!` : `${product.stock} in stock`}</span>
    </div>
  `;

  qtyNumber.textContent = '1';
  detailPrice.textContent = `$${String(product.price).padStart(2, '0')}.00`;

  if (soldOut) {
    detailAddBtn.style.opacity = '0.4';
    detailAddBtn.style.pointerEvents = 'none';
  } else {
    detailAddBtn.style.opacity = '1';
    detailAddBtn.style.pointerEvents = 'auto';
  }

  pageBrowse.classList.add('slide-out-left');
  pageDetail.classList.add('detail-active');
}

/* ========================================
   数量选择
   ======================================== */
function changeQty(delta) {
  if (!currentDetailProduct) return;
  const maxQty = currentDetailProduct.stock;
  const newQty = Math.max(1, Math.min(currentQty + delta, maxQty));
  if (newQty === currentQty) {
    if (delta > 0) showToast(`Only ${maxQty} in stock`);
    return;
  }
  currentQty = newQty;
  qtyNumber.textContent = currentQty;
  qtyNumber.classList.remove('bump');
  void qtyNumber.offsetWidth;
  qtyNumber.classList.add('bump');
  const total = currentDetailProduct.price * currentQty;
  detailPrice.textContent = `$${String(total).padStart(2, '0')}.00`;
}

/* ========================================
   从详情页加购
   ======================================== */
function addFromDetail() {
  if (!currentDetailProduct) return;
  if (currentDetailProduct.stock <= 0) return;

  const qtyToAdd = Math.min(currentQty, currentDetailProduct.stock);
  flyToCart(detailAddBtn, currentDetailProduct);
  addCartData(currentDetailProduct.id, qtyToAdd);

  // 扣减库存
  currentDetailProduct.stock -= qtyToAdd;
  saveProducts();

  detailAddBtn.style.background = '#34c759';
  setTimeout(() => { detailAddBtn.style.background = '#FFD60A'; }, 300);

  showToast(`Added ${qtyToAdd} to cart`);
}

/* ========================================
   从浏览页加购
   ======================================== */
function addToCart(id, btnEl) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock <= 0) return;

  flyToCart(btnEl, product);
  addCartData(id, 1);

  // 扣减库存
  product.stock -= 1;
  saveProducts();

  // 按钮反馈
  btnEl.classList.add('success');
  const svg = btnEl.querySelector('svg');
  const origHTML = svg.innerHTML;
  svg.innerHTML = '<path d="M3 8l3.5 3.5L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  setTimeout(() => {
    btnEl.classList.remove('success');
    svg.innerHTML = origHTML;
  }, 600);

  // 如果库存变0或低，刷新网格
  if (product.stock <= 0 || product.stock <= 10) {
    setTimeout(() => renderProductGrid(), 650);
  }
}

/* ========================================
   核心动效: 商品飞入购物车
   ======================================== */
function flyToCart(fromEl, product) {
  const fromRect = fromEl.getBoundingClientRect();
  const appRect = app.getBoundingClientRect();
  const cartRect = cartBar.getBoundingClientRect();

  const startX = fromRect.left - appRect.left + fromRect.width / 2 - 40;
  const startY = fromRect.top - appRect.top + fromRect.height / 2 - 55;
  const endX = cartRect.left - appRect.left + 20;
  const endY = cartRect.top - appRect.top + 10;

  flyClone.innerHTML = productImageHTML(product);
  flyClone.style.left = startX + 'px';
  flyClone.style.top = startY + 'px';
  flyClone.style.transform = 'scale(1) rotate(0deg)';
  flyClone.style.opacity = '1';
  flyClone.classList.add('flying');

  const duration = 650;
  const startTime = performance.now();
  const ctrlX = (startX + endX) / 2 + 40;
  const ctrlY = Math.min(startY, endY) - 120;

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x = Math.pow(1 - eased, 2) * startX + 2 * (1 - eased) * eased * ctrlX + Math.pow(eased, 2) * endX;
    const y = Math.pow(1 - eased, 2) * startY + 2 * (1 - eased) * eased * ctrlY + Math.pow(eased, 2) * endY;
    const scale = 1 - eased * 0.6;
    const rotate = eased * 180;

    flyClone.style.left = x + 'px';
    flyClone.style.top = y + 'px';
    flyClone.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      flyClone.style.opacity = '0';
      flyClone.classList.remove('flying');
      cartBar.classList.add('bounce');
      setTimeout(() => cartBar.classList.remove('bounce'), 500);
      cartBarBadge.classList.add('pop');
      setTimeout(() => cartBarBadge.classList.remove('pop'), 400);
    }
  }
  requestAnimationFrame(animate);
}

/* ========================================
   购物车数据管理
   ======================================== */
function addCartData(id, qty) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      bg: product.bg,
      bagBg: product.bagBg,
      bagText: product.bagText,
      bagSub: product.bagSub,
      image: product.image,
      qty: qty
    });
  }
  saveCart();
  updateCartBar();
}

function updateCartBar() {
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  cartBarBadge.textContent = totalItems;
  cartBarSub.textContent = totalItems === 1 ? '1 item' : `${totalItems} items`;
  cartBadgeTop.textContent = totalItems;

  if (totalItems > 0) {
    cartBar.classList.remove('hidden');
  } else {
    cartBar.classList.add('hidden');
  }

  cartBarThumbs.innerHTML = cart.slice(0, 3).map(c =>
    `<div class="cart-thumb" style="background:${c.bg || '#f0f0f3'}">
      ${thumbImageHTML(c)}
    </div>`
  ).join('');

  if (pageCart.classList.contains('cart-active')) {
    renderCartBody();
  }
}

/* ========================================
   渲染购物车页
   ======================================== */
function renderCartBody() {
  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align:center;padding:60px 0;color:#666">
        <p style="font-size:16px;font-weight:600;color:#fff">Your cart is empty</p>
        <p style="font-size:13px;color:#888;margin-top:8px">Add some snacks!</p>
      </div>
    `;
    return;
  }

  const itemsHTML = cart.map((c, i) => `
    <div class="cart-item" style="animation-delay:${0.05 + i * 0.07}s">
      <div class="cart-item-img" style="background:${c.bg || '#f0f0f3'}">
        ${c.image
          ? `<img src="${c.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
          : productImageHTML(c)}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-sub">${c.brand || ''} · Qty ${c.qty}</div>
      </div>
      <div class="cart-item-price">$${String(c.price * c.qty).padStart(2, '0')}.00</div>
    </div>
  `).join('');

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  cartBody.innerHTML = `
    ${itemsHTML}
    <div class="cart-summary">
      <div class="cart-summary-label">Delivery Amount</div>
      <div class="cart-summary-total-label">Total Amount</div>
      <div class="cart-summary-amount">USD $${String(total).padStart(2, '0')}.00</div>
    </div>
    <button class="checkout-btn" onclick="checkout()">
      <span>Make Payment</span>
      <div class="checkout-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 8h7M8 5l3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      </div>
    </button>
  `;
}

/* ========================================
   结算
   ======================================== */
function checkout() {
  showToast('Payment successful! 🎉');
  cart = [];
  saveCart();
  updateCartBar();
  cartBar.classList.add('hidden');
  setTimeout(() => showPage('browse'), 500);
}

/* ========================================
   页面切换
   ======================================== */
function showPage(target) {
  if (target === 'browse') {
    pageBrowse.classList.remove('slide-out-left');
    pageDetail.classList.remove('detail-active');
    pageCart.classList.remove('cart-active');
    renderProductGrid();
    if (cart.length > 0) {
      cartBar.classList.remove('hidden');
    }
  } else if (target === 'cart') {
    pageBrowse.classList.add('slide-out-left');
    pageDetail.classList.remove('detail-active');
    pageCart.classList.add('cart-active');
    cartBar.classList.add('hidden');
    renderCartBody();
  }
}

/* ========================================
   筛选
   ======================================== */
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', function() {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.cat || 'All';
    renderProductGrid();
  });
});

/* ========================================
   ===== 商品管理功能 =====
   ======================================== */

/* 打开管理面板 */
function openManagePanel() {
  manageOverlay.classList.add('active');
  hideAddForm();
  renderManageList();
}

/* 关闭管理面板 */
function closeManagePanel() {
  manageOverlay.classList.remove('active');
}

/* 渲染管理列表 */
function renderManageList() {
  manageCount.textContent = products.length;

  if (products.length === 0) {
    manageList.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:#999">
        <p style="font-size:14px">No products yet</p>
        <p style="font-size:13px;margin-top:4px">Tap "Add New" to create one</p>
      </div>
    `;
    return;
  }

  manageList.innerHTML = products.map(p => {
    const soldOut = p.stock <= 0;
    const lowStock = p.stock > 0 && p.stock <= 10;
    return `
      <div class="manage-item">
        <div class="manage-item-img" style="background:${p.bg || '#f0f0f3'}">
          ${p.image
            ? `<img src="${p.image}">`
            : productImageHTML(p)}
        </div>
        <div class="manage-item-info">
          <div class="manage-item-name">${p.name}</div>
          <div class="manage-item-meta">
            <span class="manage-item-price">$${String(p.price).padStart(2, '0')}.00</span>
            <span class="manage-item-stock ${soldOut ? 'out' : lowStock ? 'low' : ''}">
              ${soldOut ? 'Out of stock' : `${p.stock} in stock`}
            </span>
          </div>
        </div>
        <div class="manage-item-actions">
          <button class="manage-item-edit" onclick="editProduct(${p.id})" title="Edit">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          </button>
          <button class="manage-item-delete" onclick="deleteProduct(${p.id})" title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* 显示添加表单 */
function showAddForm() {
  editingProductId = null;
  uploadedImage = null;
  selectedColor = '#FFF3D6';
  formTitle.textContent = 'Add New Product';
  formSaveBtn.textContent = 'Save Product';
  formName.value = '';
  formBrand.value = '';
  formPrice.value = '';
  formStock.value = '';
  formCategory.value = 'Chips';
  uploadPreview.style.display = 'none';
  uploadPlaceholder.style.display = 'flex';
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === selectedColor);
  });
  manageFormSection.style.display = 'block';
}

/* 显示编辑表单 */
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  editingProductId = id;
  uploadedImage = product.image || null;
  selectedColor = product.bg || '#FFF3D6';

  formTitle.textContent = 'Edit Product';
  formSaveBtn.textContent = 'Update Product';
  formName.value = product.name || '';
  formBrand.value = product.brand || '';
  formPrice.value = product.price || '';
  formStock.value = product.stock !== undefined ? product.stock : '';
  formCategory.value = product.cat || 'Chips';

  if (product.image) {
    uploadPreview.src = product.image;
    uploadPreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  } else {
    uploadPreview.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
  }

  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === selectedColor);
  });

  manageFormSection.style.display = 'block';
}

/* 隐藏添加表单 */
function hideAddForm() {
  manageFormSection.style.display = 'none';
}

/* 图片上传处理 */
imageInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image too large (max 2MB)');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    uploadedImage = event.target.result;
    uploadPreview.src = uploadedImage;
    uploadPreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

/* 颜色选择器 */
colorPicker.addEventListener('click', function(e) {
  const option = e.target.closest('.color-option');
  if (!option) return;
  document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
  selectedColor = option.dataset.color;
});

/* 保存商品（添加或编辑） */
function saveProduct() {
  const name = formName.value.trim();
  const brand = formBrand.value.trim();
  const price = parseFloat(formPrice.value);
  const stock = parseInt(formStock.value) || 0;
  const category = formCategory.value;

  if (!name) {
    showToast('Please enter a product name');
    formName.focus();
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Please enter a valid price');
    formPrice.focus();
    return;
  }

  if (editingProductId !== null) {
    /* 编辑现有商品 */
    const product = products.find(p => p.id === editingProductId);
    if (product) {
      product.name = name;
      product.brand = brand;
      product.price = price;
      product.stock = stock;
      product.cat = category;
      product.bg = selectedColor;
      if (uploadedImage !== null) {
        product.image = uploadedImage;
      }
      /* 如果没有自定义图，生成包装袋颜色 */
      if (!uploadedImage && !product.bagBg) {
        product.bagBg = generateBagColor(category);
        product.bagText = (brand || name).toUpperCase().substring(0, 10);
        product.bagSub = category;
      }
      showToast('Product updated!');
    }
  } else {
    /* 新增商品 */
    const newProduct = {
      id: getNextId(),
      name: name,
      brand: brand,
      price: price,
      stock: stock,
      bg: selectedColor,
      cat: category,
      image: uploadedImage,
      bagBg: uploadedImage ? null : generateBagColor(category),
      bagText: uploadedImage ? null : (brand || name).toUpperCase().substring(0, 10),
      bagSub: uploadedImage ? null : category,
    };
    products.push(newProduct);
    showToast('Product added!');
  }

  saveProducts();
  renderManageList();
  hideAddForm();

  /* 如果浏览页可见，刷新网格 */
  if (!pageDetail.classList.contains('detail-active') && !pageCart.classList.contains('cart-active')) {
    renderProductGrid();
  }
}

/* 删除商品 */
function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (!confirm(`Delete "${product.name}"?`)) return;

  products = products.filter(p => p.id !== id);
  /* 从购物车也移除 */
  cart = cart.filter(c => c.id !== id);

  saveProducts();
  saveCart();
  renderManageList();
  renderProductGrid();
  updateCartBar();
  showToast('Product deleted');
}

/* 根据分类生成包装袋颜色 */
function generateBagColor(category) {
  const colors = {
    'Chips':   '#E8650C',
    'Choco':   '#5B3A1A',
    'Drinks':  '#1A5B9E',
    'Cookies': '#C01A1A',
    'Nuts':    '#1A8A4E',
  };
  return colors[category] || '#666';
}

/* ========================================
   Toast 提示
   ======================================== */
let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

/* ========================================
   初始化
   ======================================== */
loadProducts();
loadCart();
renderProductGrid();
updateCartBar();
