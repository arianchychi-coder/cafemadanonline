/* ==========================================================================
   Article Form Script — Add / Edit
   ========================================================================== */

(() => {
  let editId = null;
  let coverImage = '';
  let galleryImages = [];
  let videoName = '';
  let currentStatus = 'draft';
  let slugTouched = false;

  document.addEventListener('DOMContentLoaded', () => {
    CafeShell.mount({ page: 'article-add', title: 'افزودن مقاله', breadcrumb: 'کافه معدن / مقالات / افزودن' });

    const params = new URLSearchParams(location.search);
    editId = params.get('id');

    bindTitleSlug();
    bindStatusTabs();
    bindEditorToolbar();
    bindUploads();
    bindFormSubmit();
    bindPreview();

    if (editId) loadForEdit(editId);
    else document.getElementById('f-date').valueAsDate = new Date();
  });

  /* ---------------------- Title -> Slug auto-generation ---------------------- */
  function bindTitleSlug() {
    const titleEl = document.getElementById('f-title');
    const slugEl = document.getElementById('f-slug');
    slugEl.addEventListener('input', () => { slugTouched = true; });
    titleEl.addEventListener('input', () => {
      if (!slugTouched) slugEl.value = CafeUtils.slugify(titleEl.value);
    });
  }

  /* ---------------------- Status tabs ---------------------- */
  function bindStatusTabs() {
    document.querySelectorAll('#f-status button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#f-status button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentStatus = btn.dataset.value;
      });
    });
  }

  /* ---------------------- Rich text editor toolbar ---------------------- */
  function bindEditorToolbar() {
    document.querySelectorAll('.editor-toolbar button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('f-content').focus();
        const cmd = btn.dataset.cmd;
        const value = btn.dataset.value || null;
        document.execCommand(cmd, false, value);
      });
    });
  }

  /* ---------------------- Uploads ---------------------- */
  function bindUploads() {
    // Cover (single, featured image)
    const coverBox = document.getElementById('cover-upload');
    const coverInput = document.getElementById('cover-input');
    coverBox.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', () => {
      const file = coverInput.files[0];
      if (!file) return;
      readAsDataUrl(file, (dataUrl) => {
        coverImage = dataUrl;
        renderCoverPreview();
        clearFieldError(document.getElementById('cover-upload').closest('.form-field'));
      });
    });

    // Gallery (multiple images)
    const galleryBox = document.getElementById('gallery-upload');
    const galleryInput = document.getElementById('gallery-input');
    galleryBox.addEventListener('click', () => galleryInput.click());
    galleryInput.addEventListener('change', () => {
      [...galleryInput.files].forEach(file => {
        readAsDataUrl(file, (dataUrl) => {
          galleryImages.push(dataUrl);
          renderGalleryPreview();
        });
      });
    });

    // Video
    const videoBox = document.getElementById('video-upload');
    const videoInput = document.getElementById('video-input');
    videoBox.addEventListener('click', () => videoInput.click());
    videoInput.addEventListener('change', () => {
      const file = videoInput.files[0];
      if (!file) return;
      videoName = file.name;
      document.getElementById('video-filename').innerHTML = `🎬 ${CafeUtils.escapeHtml(file.name)} انتخاب شد`;
    });
  }

  function readAsDataUrl(file, cb) {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  }

  function renderCoverPreview() {
    const wrap = document.getElementById('cover-preview');
    wrap.innerHTML = coverImage ? `
      <div class="upload-preview__item">
        <img src="${coverImage}" alt="تصویر شاخص">
        <button type="button" class="upload-preview__remove" onclick="ArticleForm.removeCover()">✕</button>
      </div>` : '';
  }
  function renderGalleryPreview() {
    const wrap = document.getElementById('gallery-preview');
    wrap.innerHTML = galleryImages.map((img, i) => `
      <div class="upload-preview__item">
        <img src="${img}" alt="تصویر گالری">
        <button type="button" class="upload-preview__remove" onclick="ArticleForm.removeGalleryImage(${i})">✕</button>
      </div>`).join('');
  }

  function removeCover() { coverImage = ''; renderCoverPreview(); }
  function removeGalleryImage(i) { galleryImages.splice(i, 1); renderGalleryPreview(); }

  /* ---------------------- Validation ---------------------- */
  function setFieldError(field, hasError) {
    field.classList.toggle('has-error', hasError);
    field.classList.toggle('is-valid', !hasError);
  }
  function clearFieldError(field) { field.classList.remove('has-error'); }

  function validate() {
    let valid = true;
    const fields = [
      { el: document.getElementById('f-title'), check: v => v.trim().length > 2 },
      { el: document.getElementById('f-slug'), check: v => v.trim().length > 1 },
      { el: document.getElementById('f-excerpt'), check: v => v.trim().length > 5 },
      { el: document.getElementById('f-category'), check: v => v !== '' },
      { el: document.getElementById('f-date'), check: v => v !== '' }
    ];
    fields.forEach(f => {
      const ok = f.check(f.el.value);
      setFieldError(f.el.closest('.form-field'), !ok);
      if (!ok) valid = false;
    });

    // Cover image required
    const coverField = document.getElementById('cover-upload').closest('.form-field');
    setFieldError(coverField, !coverImage);
    if (!coverImage) valid = false;

    // Content required
    const contentEl = document.getElementById('f-content');
    const contentError = document.getElementById('content-error');
    const contentEmpty = contentEl.textContent.trim().length < 10;
    contentError.style.display = contentEmpty ? 'flex' : 'none';
    if (contentEmpty) valid = false;

    return valid;
  }

  /* ---------------------- Submit ---------------------- */
  function bindFormSubmit() {
    document.getElementById('articelsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      save();
    });
    document.getElementById('btn-save').addEventListener('click', save);
  }

  function save() {
    if (!validate()) {
      CafeUI.toast({ type: 'error', title: 'اطلاعات ناقص است', desc: 'لطفا فیلدهای الزامی مشخص‌شده را تکمیل کنید.' });
      return;
    }
    const tags = document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      title: document.getElementById('f-title').value.trim(),
      slug: document.getElementById('f-slug').value.trim(),
      excerpt: document.getElementById('f-excerpt').value.trim(),
      content: document.getElementById('f-content').innerHTML,
      category: document.getElementById('f-category').value,
      tags,
      status: currentStatus,
      publishDate: new Date(document.getElementById('f-date').value).toISOString(),
      cover: coverImage,
      gallery: galleryImages,
      video: videoName
    };

    if (editId) {
      CafeStore.Articles.update(editId, data);
      CafeUI.toast({ type: 'success', title: 'مقاله به‌روزرسانی شد', desc: 'تغییرات با موفقیت ذخیره شد.' });
    } else {
      CafeStore.Articles.add({ id: CafeUtils.uid('art'), views: 0, ...data });
      CafeUI.toast({ type: 'success', title: 'مقاله ذخیره شد', desc: 'مقاله جدید با موفقیت اضافه شد.' });
    }
    setTimeout(() => location.href = 'articles.html', 900);
  }

  /* ---------------------- Load for edit ---------------------- */
  function loadForEdit(id) {
    const a = CafeStore.Articles.get(id);
    if (!a) return;
    document.getElementById('page-title').textContent = 'ویرایش مقاله | پنل مدیریت کافه معدن';
    document.getElementById('form-heading').textContent = 'ویرایش مقاله';
    document.getElementById('f-title').value = a.title;
    document.getElementById('f-slug').value = a.slug;
    slugTouched = true;
    document.getElementById('f-excerpt').value = a.excerpt;
    document.getElementById('f-category').value = a.category;
    document.getElementById('f-tags').value = (a.tags || []).join(', ');
    document.getElementById('f-content').innerHTML = a.content || `<p>${CafeUtils.escapeHtml(a.excerpt)}</p>`;
    document.getElementById('f-date').value = new Date(a.publishDate).toISOString().slice(0, 10);

    currentStatus = a.status;
    document.querySelectorAll('#f-status button').forEach(b => b.classList.toggle('is-active', b.dataset.value === a.status));

    coverImage = a.cover || '';
    galleryImages = a.gallery || [];
    videoName = a.video || '';
    renderCoverPreview();
    renderGalleryPreview();
    if (videoName) document.getElementById('video-filename').innerHTML = `🎬 ${CafeUtils.escapeHtml(videoName)} انتخاب شد`;
  }

  /* ---------------------- Preview modal ---------------------- */
  function bindPreview() {
    document.getElementById('btn-preview').addEventListener('click', () => {
      const title = document.getElementById('f-title').value.trim() || 'بدون عنوان';
      const excerpt = document.getElementById('f-excerpt').value.trim();
      const content = document.getElementById('f-content').innerHTML;
      const category = document.getElementById('f-category').value || 'بدون دسته‌بندی';
      document.getElementById('preview-body').innerHTML = `
        ${coverImage ? `<img src="${coverImage}" style="width:100%; border-radius: var(--radius-md); margin-bottom: var(--sp-5);">` : ''}
        <span class="badge badge--neutral" style="margin-bottom: var(--sp-3);">${CafeUtils.escapeHtml(category)}</span>
        <h2 style="font-size: var(--fs-xl); margin-bottom: var(--sp-2);">${CafeUtils.escapeHtml(title)}</h2>
        <p class="text-muted" style="margin-bottom: var(--sp-5);">${CafeUtils.escapeHtml(excerpt)}</p>
        <div style="line-height:1.9;">${content || '<p class="text-muted">هنوز محتوایی وارد نشده است.</p>'}</div>`;
      CafeUI.openModal('preview-modal');
    });
  }

  window.ArticleForm = { removeCover, removeGalleryImage };
})();