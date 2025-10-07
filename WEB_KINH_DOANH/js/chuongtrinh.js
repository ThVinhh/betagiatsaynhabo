// --------------------- IMPORT FIREBASE ---------------------
import {
    db,
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
  } from "./firebaseConfig.js";
  
  // --------------------- CHƯƠNG TRÌNH KHUYẾN MÃI ---------------------
  const listEl = document.getElementById("listPrograms");
  const btnOpenAdd = document.getElementById("btnOpenAdd");
  const modal = document.getElementById("modalProgram");
  const form = document.getElementById("formProgram");
  const modalTitle = document.getElementById("modalTitle");
  const btnCancel = document.getElementById("btnCancel");
  
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnClear = document.getElementById("btnClear");
  
  const colPrograms = collection(db, "programs");
  let programs = []; // cache
  
  // helper alert
  function showToast(msg, isError = false) {
    if (isError) alert("❌ " + msg);
    else alert("✅ " + msg);
  }
  
  // --------------------- LOAD PROGRAMS ---------------------
  async function loadPrograms() {
    try {
      const snap = await getDocs(colPrograms);
      programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderPrograms(programs);
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải chương trình: " + err.message, true);
    }
  }
  
  function renderPrograms(data) {
    if (!Array.isArray(data)) data = [];
    listEl.innerHTML = data
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((p) => {
        const when = `${p.startDate || "—"} → ${p.endDate || "—"}`;
        const discount =
          p.type === "percent"
            ? `${p.value}%`
            : `${Number(p.value || 0).toLocaleString()}₫`;
        const active = p.active === true || p.active === "true";
        return `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${when}</td>
            <td>${discount}</td>
            <td>${active ? "Kích hoạt" : "Tạm dừng"}</td>
            <td>${(p.note || "").length > 50
              ? (p.note || "").slice(0, 50) + "…"
              : p.note || ""
            }</td>
            <td class="actions">
              <button class="btn-toggle" onclick="toggleActive('${p.id}', ${active})">${active ? "Tắt" : "Bật"}</button>
              <button class="btn-edit" onclick="openEdit('${p.id}')">✏️ Sửa</button>
              <button class="btn-delete" onclick="deleteProgram('${p.id}')">🗑️ Xóa</button>
            </td>
          </tr>
        `;
      })
      .join("");
  }
  
  // --------------------- MODAL ADD/EDIT ---------------------
  btnOpenAdd.addEventListener("click", () => {
    form.reset();
    document.getElementById("code").disabled = false;
    modalTitle.textContent = "➕ Thêm chương trình";
    modal.style.display = "flex";
  });
  
  btnCancel.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
  
  // --------------------- SUBMIT FORM ---------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("code").value.trim();
    const name = document.getElementById("name").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const type = document.getElementById("type").value;
    const value = Number(document.getElementById("value").value) || 0;
    const note = document.getElementById("note").value.trim();
    const active = document.getElementById("active").value === "true";
  
    if (!id || !name) return showToast("Mã và tên là bắt buộc.", true);
    if (startDate && endDate && startDate > endDate)
      return showToast("Ngày bắt đầu phải <= ngày kết thúc.", true);
  
    const payload = {
      name,
      startDate,
      endDate,
      type,
      value,
      note,
      active,
      updatedAt: serverTimestamp(),
    };
  
    try {
      const docRef = doc(db, "programs", id);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        await updateDoc(docRef, payload);
        showToast("Đã cập nhật chương trình.");
      } else {
        await setDoc(docRef, { id, ...payload, createdAt: serverTimestamp() });
        showToast("Đã tạo chương trình mới.");
      }
      modal.style.display = "none";
      loadPrograms();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi lưu: " + err.message, true);
    }
  });
  
  // --------------------- EDIT / DELETE / TOGGLE ---------------------
  window.openEdit = async (id) => {
    try {
      const docRef = doc(db, "programs", id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return showToast("Không tìm thấy chương trình", true);
      const p = snap.data();
  
      document.getElementById("code").value = p.id || id;
      document.getElementById("code").disabled = true;
      document.getElementById("name").value = p.name || "";
      document.getElementById("startDate").value = p.startDate || "";
      document.getElementById("endDate").value = p.endDate || "";
      document.getElementById("type").value = p.type || "percent";
      document.getElementById("value").value = p.value || 0;
      document.getElementById("note").value = p.note || "";
      document.getElementById("active").value =
        p.active === true || p.active === "true" ? "true" : "false";
  
      modalTitle.textContent = "✏️ Chỉnh sửa chương trình";
      modal.style.display = "flex";
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi mở chương trình", true);
    }
  };
  
  window.deleteProgram = async (id) => {
    if (!confirm(`Xóa chương trình ${id} ?`)) return;
    try {
      await deleteDoc(doc(db, "programs", id));
      showToast("Đã xóa chương trình.");
      loadPrograms();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa: " + err.message, true);
    }
  };
  
  window.toggleActive = async (id, current) => {
    try {
      await updateDoc(doc(db, "programs", id), {
        active: !current,
        updatedAt: serverTimestamp(),
      });
      loadPrograms();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi cập nhật trạng thái", true);
    }
  };
  
  // --------------------- SEARCH ---------------------
  btnSearch.addEventListener("click", () => {
    const k = searchInput.value.trim().toLowerCase();
    if (!k) return renderPrograms(programs);
    const filtered = programs.filter((p) =>
      (p.id + " " + (p.name || "")).toLowerCase().includes(k)
    );
    renderPrograms(filtered);
  });
  
  btnClear.addEventListener("click", () => {
    searchInput.value = "";
    renderPrograms(programs);
  });
  
  // --------------------- COUPON | PHIẾU CHI ---------------------
  const btnOpenCouponPhieu = document.getElementById("btnOpenCouponPhieu");
  const modalCouponPhieu = document.getElementById("modalCouponPhieu");
  const formCouponPhieu = document.getElementById("formCouponPhieu");
  const btnCancelCouponPhieu = document.getElementById("btnCancelCouponPhieu");
  
  btnOpenCouponPhieu.addEventListener("click", () => {
    formCouponPhieu.reset();
    modalCouponPhieu.style.display = "flex";
  });
  
  btnCancelCouponPhieu.addEventListener("click", () => {
    modalCouponPhieu.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modalCouponPhieu) modalCouponPhieu.style.display = "none";
  });
  
  // helper sinh mã coupon 10 ký tự số
  function generateCouponCode() {
    return Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
  }
  
  formCouponPhieu.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const loai = document.getElementById("loai").value;
    const sdt = document.getElementById("sdt").value.trim();
    const soTien = parseInt(document.getElementById("soTien").value);
    const noiDung = document.getElementById("noiDung").value.trim();
  
    if (!sdt || !soTien || !noiDung)
      return showToast("⚠️ Vui lòng nhập đầy đủ thông tin", true);
  
    try {
      const ma = generateCouponCode();
      const collectionName = loai === "coupon" ? "coupons" : "phieuchi";
  
      await setDoc(doc(db, collectionName, ma), {
        ma,
        loai,
        sdt,
        soTien,
        noiDung,
        trangThai: "chưa sử dụng",
        createdAt: serverTimestamp(),
      });
  
    // ✅ hiển thị thông tin trực tiếp trong alert (tùy chọn)
    showToast(
        `${loai.toUpperCase()} đã tạo thành công!\n\n` +
        `📄 Mã: ${ma}\n📞 SĐT: ${sdt}\n⚙️ Trạng thái: chưa sử dụng`
      );
  
      formCouponPhieu.reset();
      modalCouponPhieu.style.display = "none";
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tạo phiếu: " + err.message, true);
    }
  });


  
  // --------------------- DANH SÁCH COUPON | PHIẾU CHI ---------------------
  const btnViewCoupons = document.getElementById("btnViewCoupons");
  const modalListCoupons = document.getElementById("modalListCoupons");
  const btnCloseCouponList = document.getElementById("btnCloseCouponList");
  const listCoupons = document.getElementById("listCoupons");
  const searchCoupon = document.getElementById("searchCoupon");
  const btnSearchCoupon = document.getElementById("btnSearchCoupon");
  const btnClearCoupon = document.getElementById("btnClearCoupon");
  
  let allCoupons = [];
  
  btnViewCoupons.addEventListener("click", async () => {
    modalListCoupons.style.display = "flex";
    await loadCoupons();
  });
  
  btnCloseCouponList.addEventListener("click", () => {
    modalListCoupons.style.display = "none";
  });
  
  window.addEventListener("click", (e) => {
    if (e.target === modalListCoupons) modalListCoupons.style.display = "none";
  });
  
  async function loadCoupons() {
    const col1 = collection(db, "coupons");
    const col2 = collection(db, "phieuchi");
  
    const [snap1, snap2] = await Promise.all([getDocs(col1), getDocs(col2)]);
    allCoupons = [
      ...snap1.docs.map((d) => ({ id: d.id, ...d.data() })),
      ...snap2.docs.map((d) => ({ id: d.id, ...d.data() })),
    ];
  
    renderCoupons(allCoupons);
  }
  
  function renderCoupons(data) {
    if (!Array.isArray(data)) data = [];
    listCoupons.innerHTML = data
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .map((c) => {
        const date = c.createdAt
          ? new Date(c.createdAt.seconds * 1000).toLocaleString("vi-VN")
          : "—";
        return `
          <tr>
            <td>${c.ma || c.id}</td>
            <td>${c.loai?.toUpperCase()}</td>
            <td>${c.sdt}</td>
            <td>${Number(c.soTien || 0).toLocaleString()}₫</td>
            <td>${c.noiDung || ""}</td>
            <td>${c.trangThai || "chưa sử dụng"}</td>
            <td>${date}</td>
          </tr>
        `;
      })
      .join("");
  }
  
  // tìm kiếm coupon
  btnSearchCoupon.addEventListener("click", () => {
    const k = searchCoupon.value.trim().toLowerCase();
    if (!k) return renderCoupons(allCoupons);
    const filtered = allCoupons.filter(
      (c) =>
        (c.ma || "").toLowerCase().includes(k) ||
        (c.sdt || "").toLowerCase().includes(k)
    );
    renderCoupons(filtered);
  });
  
  btnClearCoupon.addEventListener("click", () => {
    searchCoupon.value = "";
    renderCoupons(allCoupons);
  });
  
  // --------------------- INITIAL LOAD ---------------------
  loadPrograms();
  