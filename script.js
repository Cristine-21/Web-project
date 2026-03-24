// ===== DATA =====
// delivery fees per area
var deliveryFees = {
  'Angat': 0, 'Balagtas': 0, 'Baliuag': 0,
  'Bocaue': 0, 'Bulakan': 0, 'Bustos': 0,
  'Calumpit': 0, 'Doña Remedios Trinidad': 0, 'Guiguinto': 0,
  'Hagonoy': 0, 'Malolos': 0, 'Marilao': 0, 'Obando': 0,
  'Meycauayan': 0, 'Norzagaray': 0, 'Pandi': 0,
  'Paombong': 0, 'Plaridel': 0, 'Pulilan': 0,
  'San Ildefonso': 0, 'San Jose Del Monte': 0, 'San Miguel': 0,
  'San Rafael': 0, 'Santa Maria': 0, 'Pampanga (Other)': 0
};

var flavors = [
  'Fruit Salad','Cheese Langka','Strawberry','Cheese Overload','Ube Cheese','Cookies & Cream',
  'Rocky Road']

var products = [
  { id:'pkg-1', name:'Party Packages 1', emoji:'🎉', desc:'100 pax', category:'package',
    choices:[{id:'c1',name:'1 Flavor',price:4000, maxFlavors:1},{id:'c2',name:'2 Flavors',price:4500, maxFlavors:2}], stock:10 },
  { id:'pkg-2', name:'Party Packages 2', emoji:'🎉', desc:'200 pax', category:'package',
    choices:[{id:'c1',name:'2 Flavors',price:7500, maxFlavors:2},{id:'c2',name:'3 Flavors',price:8000, maxFlavors:3}], stock:5 },
  { id:'pkg-3', name:'Special Buko Lychee Sherbet Packages', emoji:'🎉', category:'package', fixedFlavor:true,
    choices:[{id:'c1',name:'100 pax',price:4500},{id:'c2',name:'200 pax',price:8000}], stock:5 },
    { id:'prod-1', name:'Buko Lychee Sherbet', emoji:'🍨', desc:'Special Sherbet', category:'product', fixedFlavor:true,
    choices:[{id:'c1',name:'750ml',price:150},{id:'c2',name:'1 Mayo Canister',price:700}, {id:'c3',name:'3 Gallons Stainless Tub',price:1700}], stock:50 },
  { id:'prod-2', name:'Ice Cream', emoji:'🍦', desc:'3 Gallons Stainless Tub', category:'product',
    choices:[{id:'c1',name:'1 Flavor',price:1600, maxFlavors:1},{id:'c2',name:'2 Flavors',price:1800, maxFlavors:2}], stock:5 },
  
];

// cart & order state
var cart = [];
var currentDeliveryFee = 0;
var orderSchedule = { date:'', time:'', area:'', address:'' };

// temp for flavor picking
var flavorPicking = { productId:'', choiceId:'', max:[], selected:[], qty:1, productName:'' };

// orders for admin (demo data)
var orders = [
  { id:'ORD-001', customer:'Maria Santos', date:'2026-03-018', time:'2:00 PM', area:'Marilao',
   address:'123 Sampaguita St., Brgy. Loma de Gato, Marilao, Bulacan',
    items:'Party Packages 1 (Cookies & Cream, Rocky Road) x1', paid:4500, balance:4300, total:8600, status:'pending' },
  { id:'ORD-002', customer:'Juan Cruz', date:'2026-03-05', time:'10:00 AM', area:'Malolos',
    address:'Blk 2 Lot 5, Golden Ville Subd., Brgy. Mojon, Malolos, Bulacan',
    items:'Party Packages 2 (Strawbery, Ube Cheese) (', paid:3750, balance:3750, total:1200, status:'confirmed' }
];
function isPackageDataBooked(date){
    return orders.some(function(o){
        return o.date === date && o.items.toLowerCase().includes('package')
        && o.status !== 'cancelled';
    })
}

// ===== NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'dashboard') renderDashboard();
}

// ===== ORDER PAGE =====
// set min date to today when page loads
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('order-date').min = new Date().toISOString().split('T')[0];
});

function updateDeliveryFee() {
  var area = document.getElementById('order-area').value;
  currentDeliveryFee = deliveryFees[area] || 0;
}


function continueToProducts() {
  var date = document.getElementById('order-date').value;
  var time = document.getElementById('order-time').value;
  var area = document.getElementById('order-area').value;
  var address = document.getElementById('order-address').value.trim();
  if (!date || !time || !area || !address) {
    alert('Please fill in all fields including your full address!');
    return;
  }
  if (isPackageDataBooked(date)){
alert("This date already has a booked event package. Please choose another date.");
return;
  }
  orderSchedule = { date: date, time: time, area: area, address: address };
  updateDeliveryFee();
  renderProducts();
  document.getElementById('products-section').style.display = 'block';
}

function renderProducts() {
  var pkgGrid = document.getElementById('packages-grid');
  var prodGrid = document.getElementById('products-grid');
  pkgGrid.innerHTML = '';
  prodGrid.innerHTML = '';

  products.forEach(function(p) {
    var html = '<div class="card">' +
      '<div class="product-emoji">' + p.emoji + '</div>' +
      '<h3>' + p.name + '</h3>' +
      '<p>' + p.desc + '</p>' +
      '<p style="font-size:0.8rem;color:#888;">Stock: ' + p.stock + '</p>' +
      '<div id="choices-' + p.id + '">';

    p.choices.forEach(function(c) {
      html += '<label class="choice-item">' +
        '<input type="checkbox" name="choice-' + p.id + '" value="' + c.id + '" ' +
        'onchange="handleChoice(\'' + p.id + '\',\'' + c.id + '\')">' +
        '<span>' + c.name + ' - <span class="price-tag">₱' + c.price.toLocaleString() + '</span></span>' +
        '</label>';
    });

    html += '</div><div id="action-' + p.id + '" style="margin-top:10px;"></div></div>';

    if (p.category === 'package') pkgGrid.innerHTML += html;
    else prodGrid.innerHTML += html;
  });
}

function handleChoice(productId, choiceId) {
  var product = products.find(function(p) { return p.id === productId; });

  // uncheck other choices
  document.querySelectorAll('input[name="choice-' + productId + '"]').forEach(function(cb) {
    if (cb.value !== choiceId) cb.checked = false;
  });

  var cb = document.querySelector('input[name="choice-' + productId + '"][value="' + choiceId + '"]');
  var actionDiv = document.getElementById('action-' + productId);

  if (!cb.checked) {
    actionDiv.innerHTML = '';
    return;
  }

  var qtyElId = 'qty-' + productId;

  // CLEAR FIRST (IMPORTANT)
  actionDiv.innerHTML = '';

  // Quantity controls
  actionDiv.innerHTML =
    '<div class="qty-control">' +
      '<button onclick="changeQty(\'' + productId + '\', -1)">-</button>' +
      '<span id="' + qtyElId + '">1</span>' +
      '<button onclick="changeQty(\'' + productId + '\', 1)">+</button>' +
    '</div>';

  // Buttons
  if (product.name.includes('Buko Lychee Sherbet')) {
    actionDiv.innerHTML +=
      '<div style="margin-top:10px;display:flex;gap:8px;">' +
        '<button class="btn btn-sm" onclick="addFixedFlavor(\'' + productId + '\',\'' + choiceId + '\')">Add to Cart 🍨</button>' +
        '<button class="btn btn-sm btn-outline" onclick="buyNowFixedFlavor(\'' + productId + '\',\'' + choiceId + '\')">Buy Now</button>' +
      '</div>';
  } else {
    actionDiv.innerHTML +=
      '<div style="margin-top:10px;display:flex;gap:8px;">' +
        '<button class="btn btn-sm" onclick="pickFlavors(\'' + productId + '\',\'' + choiceId + '\')">Pick Flavors & Add 🍨</button>' +
        '<button class="btn btn-sm btn-outline" onclick="pickFlavorsBuyNow(\'' + productId + '\',\'' + choiceId + '\')">Buy Now</button>' +
      '</div>';
  }
}

// ---- Fixed-flavor Buko Lychee ----
function addFixedFlavor(productId, choiceId) {
  var product = products.find(p => p.id === productId);
  var choice = product.choices.find(c => c.id === choiceId);
  var qtyEl = document.getElementById('qty-' + productId);
  var qty = qtyEl ? parseInt(qtyEl.textContent) : 1;

  addToCart(product, choice, qty, ['Buko Lychee']);
  alert('Added to cart! 🎉');
}

function buyNowFixedFlavor(productId, choiceId) {
  var product = products.find(p => p.id === productId);
  var choice = product.choices.find(c => c.id === choiceId);
  var qtyEl = document.getElementById('qty-' + productId);
  var qty = qtyEl ? parseInt(qtyEl.textContent) : 1;

  addToCart(product, choice, qty, ['Buko Lychee']);
  goToPayment();
}

// ---- Products with flavor picker ----
function pickFlavorsBuyNow(productId, choiceId) {
  pickFlavors(productId, choiceId); // open flavor modal
  // override confirm to go to payment
  var oldConfirm = confirmFlavors;
  confirmFlavors = function() {
    if (flavorPicking.selected.length === 0) {
      alert('Please pick at least 1 flavor');
      return;
    }
    var product = products.find(function(p) { return p.id === flavorPicking.productId; });
    var choice = product.choices.find(function(c) { return c.id === flavorPicking.choiceId; });

    addToCart(product, choice, flavorPicking.qty, flavorPicking.selected);
    closeFlavors();
    goToPayment(); // DIRECTLY to payment
    confirmFlavors = oldConfirm; // restore original
  };
}

function changeQty(productId, delta) {
  var el = document.getElementById('qty-' + productId);
  var val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  el.textContent = val;
}

// ===== FLAVOR PICKING =====

 function pickFlavors(productId, choiceId) {
  var product = products.find(function(p) { return p.id === productId; });
  var choice = product.choices.find(function(c) { return c.id === choiceId; }); //ADD THIS

  var qtyEl = document.getElementById('qty-' + productId);
  var qty = qtyEl ? parseInt(qtyEl.textContent) : 1;

  flavorPicking = {
    productId: productId,
    choiceId: choiceId,
    max: choice.maxFlavors || 1,   // DITO ANG FIX
    selected: [],
    qty: qty,
    productName: product.name
  };

  document.getElementById('flavor-info').textContent =
    'Pick up to ' + flavorPicking.max + ' flavor(s) for ' + product.name;

  var container = document.getElementById('flavor-options');
  container.innerHTML = '';
  flavors.forEach(function(f) {
    container.innerHTML += '<span class="flavor-tag" onclick="toggleFlavor(this,\'' + f + '\')">' + f + '</span>';
  });

  document.getElementById('flavor-modal').classList.add('open');
}

function toggleFlavor(el, flavor) {
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    flavorPicking.selected = flavorPicking.selected.filter(function(f) { return f !== flavor; });
  } else {
    if (flavorPicking.selected.length >= flavorPicking.max) {
      alert('Max ' + flavorPicking.max + ' flavors only!');
      return;
    }
    el.classList.add('selected');
    flavorPicking.selected.push(flavor);
  }
}

function confirmFlavors() {
  if (flavorPicking.selected.length === 0) {
    alert('Please pick at least 1 flavor');
    return;
  }
  var product = products.find(function(p) { return p.id === flavorPicking.productId; });
  var choice = product.choices.find(function(c) { return c.id === flavorPicking.choiceId; });

  addToCart(product, choice, flavorPicking.qty, flavorPicking.selected);
  closeFlavors();
  alert('Added to cart! 🎉');
}

function closeFlavors() {
  document.getElementById('flavor-modal').classList.remove('open');
}

// ===== CART =====
function addToCart(product, choice, qty, selectedFlavors) {
  // Find existing item with same product, choice, and flavors
  var existing = cart.find(function(i) {
    return i.productId === product.id && 
           i.choiceId === choice.id &&
           // Check if flavors are the same
           arraysEqual(i.flavors, selectedFlavors);
  });

  if (existing) {
    // Same product, choice, and flavors: increase qty
    existing.qty += qty;
  } else {
    // Different flavors: add a new item
    cart.push({
      productId: product.id,
      productName: product.name,
      choiceId: choice.id,
      choiceName: choice.name,
      price: choice.price,
      qty: qty,
      flavors: selectedFlavors.slice()
    });
  }
  updateCartBadge();
}

// Helper function to compare two arrays
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  a = a.slice().sort();
 
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function updateCartBadge() {
  document.getElementById('cart-count').textContent = cart.length;
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-panel').style.display = 'block';
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-panel').style.display = 'none';
}

function renderCart() {
  var container = document.getElementById('cart-items');
  var totalSection = document.getElementById('cart-total-section');

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:30px;">Cart is empty 😢</p>';
    totalSection.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  if (orderSchedule.date) {
    container.innerHTML += '<div style="background:#fff0f5;padding:10px;border-radius:8px;font-size:0.85rem;margin-bottom:10px;">' +
      '<strong>📅</strong> ' + orderSchedule.date + ' at ' + orderSchedule.time + '<br>' +
      '<strong>📍</strong> ' + orderSchedule.address + '</div>';
  }

  var subtotal = 0;
  cart.forEach(function(item, i) {
  var itemTotal = item.price * item.qty;
  subtotal += itemTotal;

  // Build flavors display
  var flavorText = '';
  if (item.flavors && item.flavors.length > 0) {
    flavorText = '<br><span style="font-size:0.8rem;color:#aaa;">Flavors: ' + item.flavors.join(', ') + '</span>';
  }

  // For items like packages, 3 gallons, Ice Cream, show flavors for each qty
  var flavorDetails = '';
  if (
    item.productId.startsWith('pkg-') || 
    item.productName.includes('3 Gallons') ||
    item.productName === 'Ice Cream'
  ) {
    // Repeat flavors for each quantity
    for (let q = 0; q < item.qty; q++) {
      flavorDetails += '<div style="margin-left:10px;font-size:0.75rem;">- ' + (item.flavors.join(', ') || 'No flavors selected') + '</div>';
    }
  }

  container.innerHTML += '<div class="cart-item">' +
    '<button class="remove-btn" onclick="removeCartItem(' + i + ')">✕</button>' +
    '<strong>' + item.productName + '</strong><br>' +
    '<span style="font-size:0.85rem;color:#888;">' + item.choiceName + ' × ' + item.qty + '</span>' + flavorText + flavorDetails + '<br>' +
    '<span class="price-tag">₱' + itemTotal.toLocaleString() + '</span></div>';
});
  var total = subtotal + currentDeliveryFee;
  document.getElementById('cart-subtotal').textContent = '₱' + subtotal.toLocaleString();
  document.getElementById('cart-delivery').textContent = '₱' + currentDeliveryFee.toLocaleString();
  document.getElementById('cart-total').textContent = '₱' + total.toLocaleString();
  totalSection.style.display = 'block';
}

function removeCartItem(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function goToPayment() {
  if (cart.length === 0) return;

  closeCart();

  var total = cart.reduce((s, i) => s + i.price * i.qty, 0) + currentDeliveryFee;

  var hasPackage = cart.some(i => i.productId.startsWith('pkg-'));
  var has3Gallon = cart.some(i => i.choiceName.includes('3 Gallons'));
var hasIceCream = cart.some(i => i.productName === 'Ice Cream');
  document.getElementById('pay-address').value = orderSchedule.address;
  document.getElementById('pay-total-display').textContent = '₱' + total.toLocaleString();

 if (hasPackage || has3Gallon || hasIceCream) {
  var half = Math.ceil(total / 2);
  document.getElementById('pay-amount').value = half;
  document.getElementById('pay-amount').min = half;
}
  showPage('payment');
}

document.getElementById('pay-method').addEventListener('change', function() {
  var selectedMethod = this.value.trim();

  if (selectedMethod === "GCash") { // <-- only trigger for GCash
    document.getElementById('qr-appear').style.display = 'block';
    document.getElementById('screenshot-appear').style.display = 'block';
  } else {
    document.getElementById('qr-appear').style.display = 'none';   
    document.getElementById('screenshot-appear').style.display = 'none'; 
  }
});

// ===== PAYMENT =====
function submitPayment() {
  var name = document.getElementById('pay-name').value.trim();
  var contact = document.getElementById('pay-contact').value.trim();
  var email = document.getElementById('pay-email').value.trim();
  var method = document.getElementById('pay-method').value;
  var amount = parseInt(document.getElementById('pay-amount').value);
var screenshot = document.getElementById('pay-screenshot').files[0];
  var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0) + currentDeliveryFee;

  var hasPackage = cart.some(i => i.productId.startsWith('pkg-'));
  var has3Gallon = cart.some(i => i.choiceName.includes('3 Gallons'));
var hasIceCream = cart.some(i => i.productName === 'Ice Cream');
  // REQUIRED FIELDS FIX
 if (!name || !contact || !email || !method) {
  alert('Please fill in all required fields!');
  return;
}

if(method === "GCash" && !screenshot){
  alert("Please upload your GCash payment screenshot!");
  return;
}

  //  PACKAGE BOOKING RULE (2 DAYS BEFORE)
  if (hasPackage) {
    var schedDate = new Date(orderSchedule.date);
    var now = new Date();
    var diff = (schedDate - now) / (1000 * 60 * 60 * 24);

    if (diff < 2) {
      alert("Packages must be booked at least 2 days before.");
      return;
    }
  }

  //  COD RESTRICTIONS
if (method === "Cash on Delivery") {

  if (hasPackage) {
    alert("Packages are NOT allowed for Cash on Delivery.");
    return;
  }

  if (has3Gallon) {
    alert("3 Gallon Stainless Tub is NOT allowed for Cash on Delivery.");
    return;
  }

 if (hasIceCream) {
    alert("Ice Cream is NOT allowed for Cash on Delivery.");
    return;
  }

  if (amount !== 0) {
    alert("For COD, amount paid should be 0.");
    return;
  }
}

  // GCASH RULES
if (method === "GCash") {

  var half = Math.ceil(total / 2);

  if (hasPackage && amount < half) {
    alert("Packages require at least 50% downpayment or full payment.");
    return;
  }

  if (has3Gallon && amount < half) {
    alert("3 Gallon Stainless Tub requires at least 50% downpayment or full payment.");
    return;
  }

  if (hasIceCream && amount < half) {
    alert("Ice Cream requires at least 50% downpayment or full payment.");
    return;
  }
}

  // RECEIPT
  var receiptHtml = '<table>' +
    '<tr><td>Customer</td><td>' + name + '</td></tr>' +
    '<tr><td>Contact</td><td>' + contact + '</td></tr>' +
    '<tr><td>Email</td><td>' + email + '</td></tr>' +
    '<tr><td>Address</td><td>' + document.getElementById('pay-address').value + '</td></tr>' +
    '<tr><td>Schedule</td><td>' + orderSchedule.date + ' at ' + orderSchedule.time + '</td></tr>' +
    '<tr><td colspan="2"><strong>Items</strong></td></tr>';

  cart.forEach(function(item) {
  var flavorText = '';
  if (item.flavors && item.flavors.length > 0) {
    flavorText = ' (Flavors: ' + item.flavors.join(', ') + ')';
  }
  receiptHtml += '<tr><td>' + item.productName + flavorText + ' (' + item.choiceName + ') x' + item.qty +
    '</td><td>₱' + (item.price * item.qty).toLocaleString() + '</td></tr>';
});

  var balance = method === "Cash on Delivery" ? total : total - amount;

  receiptHtml +=
    '<tr><td>Delivery Fee</td><td>₱' + currentDeliveryFee.toLocaleString() + '</td></tr>' +
    '<tr><td>Total</td><td>₱' + total.toLocaleString() + '</td></tr>' +
    '<tr><td>Paid</td><td>₱' + amount.toLocaleString() + '</td></tr>' +
    '<tr><td>Balance</td><td>₱' + balance.toLocaleString() + '</td></tr>' +
    '<tr><td>Method</td><td>' + method + '</td></tr></table>' +
    '<p style="font-size:0.75rem;color:#888;margin:10px 0;">*Customers can cancel order as long as it’s at least <strong>3 days before the scheduled date</strong> .</p>' +
     '<p style="font-size:0.75rem;color:#888;margin:10px 0;">* To cancel, contact us at <strong>0929-214-1697 or message our social media accounts</strong> .</p>' +
    '<p style="text-align:center;margin-top:15px;font-size:0.85rem;color:#888;">Thank you for your order! 🍦</p>'; 

  document.getElementById('receipt-body').innerHTML = receiptHtml;

  // SAVE ORDER
  orders.push({
  id: 'ORD-' + String(orders.length + 1).padStart(3, '0'),
  customer: name,
  date: orderSchedule.date,
  time: orderSchedule.time,
  items: cart.map(i => i.productName + (i.flavors.length > 0 ? ' (' + i.flavors.join(', ') + ')' : '') + ' x' + i.qty).join(', '),
  total: total,
  paid: amount,
  balance: balance,
  status: method === "Cash on Delivery" ? "pending" : "confirmed"
});

  cart = [];
  updateCartBadge();
  resetSystem();
  showPage('receipt');
}

function backToHome() {
  showPage('home');
}
function resetSystem() {

  // reset order schedule
  orderSchedule = { date:'', time:'', area:'', address:'' };

  // clear order page
  document.getElementById('order-date').value = '';
  document.getElementById('order-time').value = '';
  document.getElementById('order-area').value = '';
  document.getElementById('order-address').value = '';

  // hide products
  document.getElementById('products-section').style.display = 'none';

  // clear payment fields
  document.getElementById('pay-name').value = '';
  document.getElementById('pay-contact').value = '';
  document.getElementById('pay-email').value = '';
  document.getElementById('pay-method').value = '';
  document.getElementById('pay-amount').value = '';

  // clear cart display
  document.getElementById('cart-items').innerHTML = '';
}
// ===== ADMIN =====
function adminLogin() {
  var email = document.getElementById('admin-email').value;
  var pass = document.getElementById('admin-pass').value;
  if (email === 'admin@scoops.ph' && pass === 'admin123') {
    showPage('dashboard');
  } else {
    alert('Wrong credentials! Try admin@scoops.ph / admin123');
  }
}

function switchTab(btn, tabId) {
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  ['tab-orders','tab-cancel','tab-income','tab-products','tab-flavors'].forEach(function(id) {
    document.getElementById(id).style.display = id === tabId ? 'block' : 'none';
  });
}

function renderDashboard() {
  var active = orders.filter(function(o) { return o.status !== 'cancelled'; });
  var cancelled = orders.filter(function(o) { return o.status === 'cancelled'; });
  var income = active.reduce(function(s, o) { return s + o.total; }, 0);

  document.getElementById('admin-stats').innerHTML =
    '<div class="stat-card"><div class="number">' + active.length + '</div><div class="label">Active Orders</div></div>' +
    '<div class="stat-card"><div class="number">' + cancelled.length + '</div><div class="label">Cancelled</div></div>' +
    '<div class="stat-card"><div class="number">₱' + income.toLocaleString() + '</div><div class="label">Income</div></div>' +
    '<div class="stat-card"><div class="number">' + products.length + '</div><div class="label">Products</div></div>';

  // orders table
  var ordersHtml = '<table class="data-table"><tr><th>ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Paid</th><th>Balance</th><th>Total</th><th>Status</th><th>Action</th></tr>';
  orders.filter(function(o) { return o.status !== 'cancelled'; }).forEach(function(o) {
    var canCancel = canCancelOrder(o);
    ordersHtml += '<tr><td>' + o.id + '</td><td>' + o.customer + '</td><td>' + o.date + '</td>' +
      '<td style="max-width:150px;">' + o.items + '</td>' + '<td>' +'₱'+ (o.paid || 0).toLocaleString() + '</td>' + '<td>' +'₱' + (o.balance || 0).toLocaleString() + '</td>' +
      '<td>' +'₱' + o.total.toLocaleString() + '</td>' +
      '<td><span class="status-badge status-' + o.status + '">' + o.status + '</span></td>' +
      '<td><button class="btn btn-sm btn-danger" ' + (canCancel ? '' : 'disabled title="Cannot cancel within 3 days of schedule"') +
      ' onclick="cancelOrder(\'' + o.id + '\')">Cancel</button></td></tr>';
  });
  ordersHtml += '</table>';
  document.getElementById('tab-orders').innerHTML = ordersHtml;

  // cancellations
  if (cancelled.length === 0) {
    document.getElementById('tab-cancel').innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No cancellations yet 👍</p>';
  } else {
    var cancelHtml = '<p style="font-size:0.85rem;color:#888;margin-bottom:10px;">⚠️ Orders can only be cancelled 3 days before schedule.</p>' +
      '<table class="data-table"><tr><th>ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th></tr>';
    cancelled.forEach(function(o) {
      cancelHtml += '<tr><td>' + o.id + '</td><td>' + o.customer + '</td><td>' + o.date + '</td><td>' + o.items + '</td><td>₱' + o.total.toLocaleString() + '</td></tr>';
    });
    cancelHtml += '</table>';
    document.getElementById('tab-cancel').innerHTML = cancelHtml;
  }

  // income
  document.getElementById('tab-income').innerHTML =
    '<div class="card"><h3>💰 Total Income from Active Orders</h3>' +
    '<p class="price-tag" style="font-size:2rem;">₱' + income.toLocaleString() + '</p></div>';

  renderProductsTab();
  renderFlavorsTab();
}

function canCancelOrder(order) {
  var schedDate = new Date(order.date);
  var now = new Date();
  var diff = (schedDate - now) / (1000 * 60 * 60 * 24);
  return diff >= 3;
}

function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;
  var order = orders.find(function(o) { return o.id === orderId; });
  if (order) order.status = 'cancelled';
  renderDashboard();
}

function renderProductsTab() {
  var html = '<button class="btn btn-sm" onclick="addNewProduct()" style="margin-bottom:15px;">+ Add Product</button>' +
    '<table class="data-table"><tr><th></th><th>Name</th><th>Category</th><th>Choices</th><th>Stock</th><th>Actions</th></tr>';

  products.forEach(function(p) {
    html += '<tr><td>' + p.emoji + '</td><td>' + p.name + '</td><td>' + p.category + '</td>' +
      '<td>' + p.choices.map(function(c) { return c.name + ' ₱' + c.price.toLocaleString(); }).join(', ') + '</td>' +
      '<td>' + p.stock + '</td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="editProduct(\'' + p.id + '\')">Edit</button> ' +
      '<button class="btn btn-sm btn-danger" onclick="deleteProduct(\'' + p.id + '\')">Del</button></td></tr>';
  });
  html += '</table>';
  document.getElementById('tab-products').innerHTML = html;
}

function addNewProduct() {
  var name = prompt('Product name:');
  if (!name) return;
  var emoji = prompt('Emoji:', '🍨');
  var desc = prompt('Description:', '');
  var cat = prompt('Category (package or product):', 'product');
  var price = parseInt(prompt('Price:', '100'));
  var stock = parseInt(prompt('Stock:', '50'));
  var maxF = parseInt(prompt('Max flavors:', '2'));

  products.push({
    id: 'prod-' + Date.now(), name: name, emoji: emoji || '🍨', desc: desc || '',
    category: cat === 'package' ? 'package' : 'product',
    choices: [{ id: 'c1', name: 'Standard', price: price || 100 }],
    maxFlavors: maxF || 2, stock: stock || 50
  });
  renderProductsTab();
}

function editProduct(id) {
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  var name = prompt('Name:', p.name);
  var stock = parseInt(prompt('Stock:', p.stock));
  var price = parseInt(prompt('Price for ' + p.choices[0].name + ':', p.choices[0].price));
  if (name) p.name = name;
  if (!isNaN(stock)) p.stock = stock;
  if (!isNaN(price)) p.choices[0].price = price;
  renderProductsTab();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(function(p) { return p.id !== id; });
  renderProductsTab();
}

function renderFlavorsTab() {
  var html = '<div style="margin-bottom:15px;display:flex;gap:8px;">' +
    '<input id="new-flavor" placeholder="New flavor name" style="padding:8px;border:2px solid #eee;border-radius:8px;">' +
    '<button class="btn btn-sm" onclick="addFlavor()">+ Add</button></div>' +
    '<div class="flavor-list">';
  flavors.forEach(function(f) {
    html += '<span class="flavor-tag selected" onclick="removeFlavor(\'' + f + '\')" title="Click to remove">' + f + ' ✕</span>';
  });
  html += '</div>';
  document.getElementById('tab-flavors').innerHTML = html;
}

function addFlavor() {
  var input = document.getElementById('new-flavor');
  var name = input.value.trim();
  if (!name || flavors.indexOf(name) !== -1) return;
  flavors.push(name);
  input.value = '';
  renderFlavorsTab();
}

function removeFlavor(name) {
  if (!confirm('Remove ' + name + '?')) return;
  flavors = flavors.filter(function(f) { return f !== name; });
  renderFlavorsTab();
}

function toggleAdminMenu() {
  var menu = document.getElementById('admin-menu');
  menu.classList.toggle('show');
}

function adminLogout() {
  document.getElementById('admin-menu').classList.remove('show');
  showPage('home');
}
