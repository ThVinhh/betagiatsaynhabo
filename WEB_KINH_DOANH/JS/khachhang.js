import {
    db,
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
  } from "./firebaseConfig.js";
  
  const colKH = collection(db, "customers");
  const list = document.getElementById("listKhachHang");
  const form = document.getElementById("formKhachHang");
  const modalAdd = document.getElementById("addModalKH");
  const btnOpenAdd = document.getElementById("btnOpenAddKH");
  const cancelAdd = document.getElementById("cancelAddKH");
  
  // Modal cảnh báo trùng
  const modalDuplicate = document.getElementById("alertDuplicateKH");
  const msgDuplicate = document.getElementById("duplicateMsg");
  const closeDuplicate = document.getElementById("closeDuplicateKH");
  
  // Modal sửa
  const modalEdit = document.getElementById("editModalKH");
  const formEdit = document.getElementById("formEditKH");
  const cancelEdit = document.getElementById("cancelEditKH");
  
  let allCustomers = [];
  
  // 📋 Load danh sách khách hàng
  async function loadCustomers() {
    const snap = await getDocs(colKH);
    allCustomers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderCustomers(allCustomers);
  }
  
  // 🧾 Render danh sách khách hàng
  function renderCustomers(data) {
    list.innerHTML = data
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(
        (kh) => `
        <tr>
          <td>${kh.id}</td>
          <td>${kh.hoTen}</td>
          <td>${kh.duong}, ${kh.phuong}, ${kh.tinh}</td>
          <td>${kh.gioiTinh}</td>
          <td class="actions">
            <button class="btn-view" onclick="viewCustomer('${kh.id}')">👁️ Xem</button>
            <button class="btn-edit" onclick="editCustomer('${kh.id}')">✏️ Sửa</button>
            <button class="btn-delete" onclick="deleteCustomer('${kh.id}')">🗑️ Xóa</button>
          </td>
        </tr>`
      )
      .join("");
  }
  
  // ➕ Mở popup thêm khách hàng
  btnOpenAdd.addEventListener("click", () => (modalAdd.style.display = "flex"));
  cancelAdd.addEventListener("click", () => (modalAdd.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modalAdd) modalAdd.style.display = "none";
    if (e.target === modalEdit) modalEdit.style.display = "none";
    if (e.target === modalDuplicate) modalDuplicate.style.display = "none";
  });
  closeDuplicate.addEventListener("click", () => (modalDuplicate.style.display = "none"));
  
  // 🔍 Tìm kiếm
  const searchInput = document.getElementById("searchKH");
  const btnSearch = document.getElementById("btnSearchKH");
  const btnClear = document.getElementById("btnClearKH");
  
  btnSearch.addEventListener("click", () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const filtered = allCustomers.filter(
      (kh) =>
        kh.hoTen.toLowerCase().includes(keyword) ||
        kh.id.toLowerCase().includes(keyword)
    );
    renderCustomers(filtered);
  });
  
  btnClear.addEventListener("click", () => {
    searchInput.value = "";
    renderCustomers(allCustomers);
  });
  
  // 💾 Thêm khách hàng mới
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const sdt = form.sdt.value.trim();
    const hoTen = form.hoTen.value.trim();
    const gioiTinh = form.querySelector('input[name="gioiTinh"]:checked')?.value;
    const tinh = form.tinh.value.trim();
    const phuong = form.phuong.value.trim();
    const duong = form.duong.value.trim();
  
    const existing = allCustomers.find((kh) => kh.id === sdt);
    if (existing) {
      msgDuplicate.textContent = `Đã có khách hàng SĐT: ${existing.id} — ${existing.hoTen}. Vui lòng kiểm tra lại.`;
      modalDuplicate.style.display = "flex";
      return;
    }
  
    const data = { id: sdt, hoTen, gioiTinh, tinh, phuong, duong };
  
    try {
      await setDoc(doc(db, "customers", sdt), data);
      alert("✅ Đã thêm khách hàng mới!");
      modalAdd.style.display = "none";
      form.reset();
      loadCustomers();
    } catch (err) {
      console.error(err);
      alert("❌ Không thể thêm khách hàng!");
    }
  });
  
  // ✏️ Sửa khách hàng
  window.editCustomer = async (id) => {
    const kh = allCustomers.find((x) => x.id === id);
    if (!kh) return alert("Không tìm thấy khách hàng!");
  
    document.getElementById("editUid").value = kh.id;
    document.getElementById("editHoTen").value = kh.hoTen;
    document.getElementById("editSdt").value = kh.id;
    document.getElementById("editTinh").value = kh.tinh;
    document.getElementById("editPhuong").value = kh.phuong;
    document.getElementById("editDuong").value = kh.duong;
    formEdit.querySelectorAll('input[name="editGioiTinh"]').forEach((r) => {
      r.checked = r.value === kh.gioiTinh;
    });
  
    modalEdit.style.display = "flex";
  };
  
  // 💾 Lưu chỉnh sửa
  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editUid").value;
    const data = {
      hoTen: document.getElementById("editHoTen").value.trim(),
      gioiTinh: formEdit.querySelector('input[name="editGioiTinh"]:checked')?.value,
      tinh: document.getElementById("editTinh").value.trim(),
      phuong: document.getElementById("editPhuong").value.trim(),
      duong: document.getElementById("editDuong").value.trim(),
    };
  
    try {
      await updateDoc(doc(db, "customers", id), data);
      alert("✅ Đã cập nhật thông tin khách hàng!");
      modalEdit.style.display = "none";
      loadCustomers();
    } catch (err) {
      console.error(err);
      alert("❌ Không thể cập nhật khách hàng!");
    }
  });
  
  cancelEdit.addEventListener("click", () => (modalEdit.style.display = "none"));
  
  // ❌ Xóa khách hàng
  window.deleteCustomer = async (id) => {
    if (confirm(`Bạn chắc chắn muốn xóa khách hàng ${id}?`)) {
      await deleteDoc(doc(db, "customers", id));
      alert("🗑️ Đã xóa khách hàng!");
      loadCustomers();
    }
  };
  
  // 👁️ Xem chi tiết khách hàng → điều hướng qua trang khác
  window.viewCustomer = (id) => {
    window.location.href = `khachhang_chitiet.html?id=${id}`;
  };
  
  loadCustomers();
  