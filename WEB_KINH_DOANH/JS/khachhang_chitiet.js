import {
    db,
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
  } from "./firebaseConfig.js";
  
  const khDetail = document.getElementById("khDetail");
  const addressList = document.getElementById("addressList");
  const orderList = document.getElementById("orderList");
  const btnAddAddress = document.getElementById("btnAddAddress");
  const modalAdd = document.getElementById("modalAddAddress");
  const formAdd = document.getElementById("formAddAddress");
  const cancelAdd = document.getElementById("cancelAddAddress");
  
  // 🆔 Lấy ID khách hàng từ URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const khId = urlParams.get("id");
  
  if (!khId) {
    khDetail.innerHTML = "<p>❌ Không tìm thấy ID khách hàng.</p>";
    throw new Error("Missing customer ID");
  }
  
  // 📋 Load chi tiết khách hàng
  async function loadCustomerDetail() {
    const ref = doc(db, "customers", khId);
    const snap = await getDoc(ref);
  
    if (!snap.exists()) {
      khDetail.innerHTML = `<p>❌ Không tìm thấy khách hàng có ID: ${khId}</p>`;
      return;
    }
  
    const kh = snap.data();
  
    khDetail.innerHTML = `
      <div class="info-line"><strong>UID (SĐT):</strong> ${kh.sdt || kh.id || khId}</div>
      <div class="info-line"><strong>Họ tên:</strong> ${kh.hoTen || "—"}</div>
      <div class="info-line"><strong>Giới tính:</strong> ${kh.gioiTinh || "—"}</div>
      <div class="info-line"><strong>Địa chỉ mặc định:</strong> ${
        kh.diaChi
          ? kh.diaChi
          : [kh.duong, kh.phuong, kh.tinh].filter(Boolean).join(", ") || "—"
      }</div>
    `;
  }
  
  // 🏠 Load danh sách địa chỉ phụ
  async function loadAddresses() {
    const ref = collection(db, "customers", khId, "addresses");
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
    if (list.length === 0) {
      addressList.innerHTML = "<p>Chưa có địa chỉ nào.</p>";
      return;
    }
  
    addressList.innerHTML = list
      .map(
        (a) => `
        <div class="address-item ${a.isDefault ? "default" : ""}">
          <span>${a.diaChi || [a.duong, a.phuong, a.tinh].filter(Boolean).join(", ")}</span>
          <div>
            ${
              !a.isDefault
                ? `<button onclick="setDefaultAddress('${a.id}')">⭐ Đặt mặc định</button>`
                : `<span>🌟 Mặc định</span>`
            }
            <button onclick="deleteAddress('${a.id}')">🗑️ Xóa</button>
          </div>
        </div>`
      )
      .join("");
  }
  
  // 💾 Thêm địa chỉ mới
  formAdd.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tinh = formAdd.tinh.value.trim();
    const phuong = formAdd.phuong.value.trim();
    const duong = formAdd.duong.value.trim();
    const isDefault = formAdd.isDefault.checked;
  
    try {
      const ref = collection(db, "customers", khId, "addresses");
      const diaChi = [duong, phuong, tinh].filter(Boolean).join(", ");
      const newRef = await addDoc(ref, { tinh, phuong, duong, diaChi, isDefault });
  
      // Nếu chọn mặc định → bỏ mặc định cũ
      if (isDefault) {
        const all = await getDocs(ref);
        for (const d of all.docs) {
          if (d.id !== newRef.id) await updateDoc(d.ref, { isDefault: false });
        }
      }
  
      alert("✅ Đã thêm địa chỉ mới!");
      modalAdd.style.display = "none";
      formAdd.reset();
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert("❌ Không thể thêm địa chỉ!");
    }
  });
  
  // ⭐ Đặt địa chỉ mặc định
  window.setDefaultAddress = async (id) => {
    const ref = collection(db, "customers", khId, "addresses");
    const snap = await getDocs(ref);
    for (const d of snap.docs) {
      await updateDoc(d.ref, { isDefault: d.id === id });
    }
    loadAddresses();
  };
  
  // 🗑️ Xóa địa chỉ
  window.deleteAddress = async (id) => {
    if (confirm("Xóa địa chỉ này?")) {
      await deleteDoc(doc(db, "customers", khId, "addresses", id));
      loadAddresses();
    }
  };
  
  // 🧾 Load danh sách đơn hàng
  async function loadOrders() {
    const ref = collection(db, "customers", khId, "orders");
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => d.data());
  
    orderList.innerHTML =
      list.length === 0
        ? "<tr><td colspan='4'>Chưa có đơn hàng nào.</td></tr>"
        : list
            .map(
              (o) => `
          <tr>
            <td>${o.maDon || "—"}</td>
            <td>${o.ngayMua || "—"}</td>
            <td>${o.tongTien ? o.tongTien.toLocaleString() + "₫" : "—"}</td>
            <td>${o.trangThai || "—"}</td>
          </tr>`
            )
            .join("");
  }
  
  // ⚡ Modal thêm địa chỉ
  btnAddAddress.addEventListener("click", () => (modalAdd.style.display = "flex"));
  cancelAdd.addEventListener("click", () => (modalAdd.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modalAdd) modalAdd.style.display = "none";
  });
  
  // 🚀 Chạy
  loadCustomerDetail();
  loadAddresses();
  loadOrders();
  