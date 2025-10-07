import {
    db,
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
  } from "./firebaseConfig.js";
  
  const form = document.getElementById("formNhanVien");
  const list = document.getElementById("listNhanVien");
  const modal = document.getElementById("editModal");
  const formEdit = document.getElementById("formEditNV");
  const cancelEdit = document.getElementById("cancelEdit");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnClearSearch = document.getElementById("btnClearSearch");
  
  const colEmployees = collection(db, "employees");
  let allEmployees = [];
  
// 🎯 Mở popup thêm nhân viên
const addModal = document.getElementById("addModal");
const btnOpenAddNV = document.getElementById("btnOpenAddNV");
const cancelAdd = document.getElementById("cancelAdd");

btnOpenAddNV.addEventListener("click", () => {
  addModal.style.display = "flex";
});

cancelAdd.addEventListener("click", () => {
  addModal.style.display = "none";
});

// Đóng modal khi bấm ra ngoài
window.addEventListener("click", (e) => {
  if (e.target === addModal) addModal.style.display = "none";
});


  // 🔔 Hộp thông báo
  const alertBox = document.createElement("div");
  alertBox.className = "alert-box";
  document.body.appendChild(alertBox);
  
  function showAlert(msg, type = "success") {
    alertBox.textContent = msg;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = "block";
    setTimeout(() => (alertBox.style.display = "none"), 3000);
  }
  
  // 📋 Load danh sách nhân viên
  async function loadEmployees() {
    try {
      const snap = await getDocs(colEmployees);
      allEmployees = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderEmployees(allEmployees);
    } catch (e) {
      console.error(e);
      showAlert("❌ Lỗi tải danh sách nhân viên!", "error");
    }
  }
  
  // 🧩 Hiển thị danh sách
  function renderEmployees(data) {
    list.innerHTML = data
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map(
        (nv) => `
          <tr>
            <td>${nv.id}</td>
            <td>${nv.hoTen}</td>
            <td>${nv.sdt}</td>
            <td>${nv.diaChi}</td>
            <td>${nv.gioiTinh}</td>
            <td>${nv.quyen}</td>
            <td>${nv.chucVu || ""}</td>
            <td>${nv.ghiChu || ""}</td>
            <td>
              <button onclick="editNV('${nv.id}')">✏️</button>
              <button onclick="deleteNV('${nv.id}')">🗑️</button>
            </td>
          </tr>`
      )
      .join("");
  }
  
  // 📦 Lấy ID kế tiếp
  async function getNextID() {
    const snap = await getDocs(colEmployees);
    const ids = snap.docs.map((d) => Number(d.id)).filter((n) => !isNaN(n));
    const maxId = ids.length ? Math.max(...ids) : 1000;
    return (maxId + 1).toString();
  }
  
  // ➕ Thêm nhân viên
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const newId = await getNextID();
    const data = {
      id: Number(newId),
      hoTen: form.hoTen.value.trim(),
      sdt: form.sdt.value.trim(),
      diaChi: `${form.duong.value.trim()}, ${form.phuong.value.trim()}, ${form.tinh.value.trim()}`,
      gioiTinh: form.querySelector('input[name="gioiTinh"]:checked')?.value || "",
      quyen: form.quyen.value,
      chucVu: form.chucVu.value.trim(),
      ghiChu: form.ghiChu.value.trim(),
    };
  
    try {
      await setDoc(doc(db, "employees", newId), data);
      showAlert(`✅ Đã thêm nhân viên mới (ID: ${newId})`);
      form.reset();
      loadEmployees();
    } catch (e) {
      console.error(e);
      showAlert("❌ Không thể thêm nhân viên!", "error");
    }
  });
  
  // ✏️ Mở form sửa
  window.editNV = async (id) => {
    try {
      const nv = allEmployees.find((nv) => nv.id == id); // ⚙ fix so sánh số / chuỗi
      if (!nv) return showAlert("❌ Không tìm thấy nhân viên!", "error");
  
      formEdit.editUid.value = id;
      formEdit.editHoTen.value = nv.hoTen;
      formEdit.editSdt.value = nv.sdt;
      const parts = nv.diaChi.split(", ");
      formEdit.editDuong.value = parts[0] || "";
      formEdit.editPhuong.value = parts[1] || "";
      formEdit.editTinh.value = parts[2] || "";
      formEdit.editQuyen.value = nv.quyen;
      formEdit.editChucVu.value = nv.chucVu || "";
      formEdit.editGhiChu.value = nv.ghiChu || "";
  
      modal.style.display = "flex";
    } catch (e) {
      console.error(e);
      showAlert("❌ Lỗi khi mở form chỉnh sửa!", "error");
    }
  };
  
  // 💾 Lưu chỉnh sửa
  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = formEdit.editUid.value;
    const updated = {
      hoTen: formEdit.editHoTen.value.trim(),
      sdt: formEdit.editSdt.value.trim(),
      diaChi: `${formEdit.editDuong.value.trim()}, ${formEdit.editPhuong.value.trim()}, ${formEdit.editTinh.value.trim()}`,
      quyen: formEdit.editQuyen.value,
      chucVu: formEdit.editChucVu.value.trim(),
      ghiChu: formEdit.editGhiChu.value.trim(),
    };
  
    try {
      await updateDoc(doc(db, "employees", id), updated);
      showAlert("✅ Đã cập nhật nhân viên!");
      modal.style.display = "none";
      loadEmployees();
    } catch (e) {
      console.error(e);
      showAlert("❌ Không thể cập nhật!", "error");
    }
  });
  
  // ❌ Xóa nhân viên
  window.deleteNV = async (id) => {
    if (confirm("Xóa nhân viên này?")) {
      try {
        await deleteDoc(doc(db, "employees", id));
        showAlert("🗑️ Đã xóa nhân viên!");
        loadEmployees();
      } catch (e) {
        console.error(e);
        showAlert("❌ Không thể xóa!", "error");
      }
    }
  };
  
  // 🔍 Nút tìm kiếm riêng
  btnSearch.addEventListener("click", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    if (!keyword) return renderEmployees(allEmployees);
  
    const filtered = allEmployees.filter(
      (nv) =>
        nv.hoTen.toLowerCase().includes(keyword) ||
        nv.sdt.toLowerCase().includes(keyword)
    );
  
    if (filtered.length === 0) {
      showAlert("⚠️ Không tìm thấy nhân viên phù hợp", "error");
    }
  
    renderEmployees(filtered);
  });
  
  // ❌ Nút xóa tìm kiếm
  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderEmployees(allEmployees);
  });
  
  // ❌ Đóng modal
  cancelEdit.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  // 🚀 Khởi chạy
  loadEmployees();
