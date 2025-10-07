import {
    db,
    collection,
    getDocs,
    setDoc,
    deleteDoc,
    doc,
    updateDoc,
  } from "./firebaseConfig.js";
  
  const form = document.getElementById("formSanPham");
  const list = document.getElementById("listSanPham");
  const colRef = collection(db, "products");
  
  // 🧾 Modal chỉnh sửa
  const modal = document.getElementById("editModal");
  const formEdit = document.getElementById("formEditSP");
  const cancelEdit = document.getElementById("cancelEdit");
  
  // 🎯 Hộp thông báo
  let alertBox = document.createElement("div");
  alertBox.className = "alert-box";
  document.body.appendChild(alertBox);
  
  function showAlert(message, type = "success") {
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = "block";
    setTimeout(() => (alertBox.style.display = "none"), 3000);
  }
  
  // 🧾 Lấy ID mới
  async function getNextId() {
    const snap = await getDocs(colRef);
    if (snap.empty) return 1;
    const ids = snap.docs.map((d) => Number(d.id)).filter((n) => !isNaN(n));
    const maxId = ids.length ? Math.max(...ids) : 0;
    return maxId + 1;
  }
  
  // 🧾 Load danh sách sản phẩm
  async function loadProducts() {
    try {
      const snap = await getDocs(colRef);
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.id - b.id);
  
      list.innerHTML = data
        .map(
          (sp) => `
          <tr>
            <td>${sp.id}</td>
            <td>${sp.name}</td>
            <td>${sp.price}</td>
            <td>${sp.qty}</td>
            <td>${sp.checkStock ? "✅" : "❌"}</td>
            <td>${sp.desc || ""}</td>
            <td>
              <button onclick="editProduct('${sp.id}')">✏️ Sửa</button>
              <button onclick="deleteProduct('${sp.id}')">🗑️ Xóa</button>
            </td>
          </tr>
        `
        )
        .join("");
    } catch (error) {
      console.error(error);
      showAlert("❌ Không thể tải danh sách sản phẩm!", "error");
    }
  }
  
  // ➕ Thêm sản phẩm
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const id = await getNextId();
      const product = {
        id,
        name: form.tenSP.value.trim(),
        price: Number(form.giaSP.value),
        qty: Number(form.soLuongSP.value),
        checkStock: form.tonKhoSP.checked,
        desc: form.moTaSP.value.trim(),
      };
      await setDoc(doc(db, "products", String(id)), product);
      form.reset();
      showAlert("✅ Đã thêm sản phẩm mới!");
      loadProducts();
    } catch (error) {
      console.error(error);
      showAlert("❌ Không thể thêm sản phẩm!", "error");
    }
  });
  
  // ✏️ Mở form chỉnh sửa
  window.editProduct = async (id) => {
    try {
      const snap = await getDocs(colRef);
      const productDoc = snap.docs.find((d) => d.id === id);
      if (!productDoc) return showAlert("❌ Không tìm thấy sản phẩm!", "error");
      const sp = productDoc.data();
  
      // Gán dữ liệu vào form
      formEdit.editID.value = id;
      formEdit.editName.value = sp.name;
      formEdit.editPrice.value = sp.price;
      formEdit.editQty.value = sp.qty;
      formEdit.editDesc.value = sp.desc || "";
      formEdit.editCheckStock.checked = sp.checkStock || false;
  
      // Hiện modal
      modal.style.display = "flex";
    } catch (error) {
      console.error(error);
      showAlert("❌ Lỗi khi mở form chỉnh sửa!", "error");
    }
  };
  
  // 💾 Lưu chỉnh sửa
  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const id = formEdit.editID.value;
      const updated = {
        name: formEdit.editName.value.trim(),
        price: Number(formEdit.editPrice.value),
        qty: Number(formEdit.editQty.value),
        desc: formEdit.editDesc.value.trim(),
        checkStock: formEdit.editCheckStock.checked,
      };
  
      await updateDoc(doc(db, "products", id), updated);
      modal.style.display = "none";
      showAlert("✅ Cập nhật thành công!");
      loadProducts();
    } catch (error) {
      console.error(error);
      showAlert("❌ Không thể cập nhật sản phẩm!", "error");
    }
  });
  
  // ❌ Hủy chỉnh sửa
  cancelEdit.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  // ❌ Xóa sản phẩm
  window.deleteProduct = async (id) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showAlert("🗑️ Đã xóa sản phẩm!");
        loadProducts();
      } catch (error) {
        console.error(error);
        showAlert("❌ Không thể xóa sản phẩm!", "error");
      }
    }
  };
  
  // 🚀 Tải khi mở trang
  loadProducts();
  