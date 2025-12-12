(function () {
  const STORAGE_KEY = 'dailyReports';
  const form = document.getElementById('report-form');
  const list = document.getElementById('report-list');
  const detail = document.getElementById('report-detail');
  const clearButton = document.getElementById('clear-data');
  const dateInput = document.getElementById('date');

  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  function loadReports() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse saved reports', e);
      return [];
    }
  }

  function saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  function renderList(reports) {
    list.innerHTML = '';
    if (reports.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-row';
      emptyRow.innerHTML = '<td colspan="3">まだ日報がありません。上のフォームから追加してください。</td>';
      list.appendChild(emptyRow);
      detail.innerHTML = '<p class="muted">日報を選択すると詳細がここに表示されます。</p>';
      return;
    }

    reports.sort((a, b) => new Date(b.date) - new Date(a.date));

    reports.forEach((report) => {
      const row = document.createElement('tr');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.innerHTML = `
        <td>${report.date}</td>
        <td>${escapeHtml(report.today).slice(0, 60)}${report.today.length > 60 ? '…' : ''}</td>
        <td>${escapeHtml(report.tomorrow).slice(0, 60)}${report.tomorrow.length > 60 ? '…' : ''}</td>
      `;
      row.addEventListener('click', () => renderDetail(report));
      row.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          renderDetail(report);
        }
      });
      list.appendChild(row);
    });
  }

  function renderDetail(report) {
    detail.innerHTML = `
      <div class="badge">${report.date}</div>
      <section>
        <h3>今日やったこと</h3>
        <p>${nl2br(escapeHtml(report.today))}</p>
      </section>
      <section>
        <h3>明日やること</h3>
        <p>${nl2br(escapeHtml(report.tomorrow))}</p>
      </section>
      <section>
        <h3>困っていること</h3>
        <p>${report.blockers ? nl2br(escapeHtml(report.blockers)) : '<span class="muted">特になし</span>'}</p>
      </section>
    `;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function nl2br(str) {
    return str.replace(/\n/g, '<br>');
  }

  function resetForm() {
    form.reset();
    dateInput.value = today;
    form.date.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const report = {
      id: crypto.randomUUID(),
      date: form.date.value,
      today: form.today.value.trim(),
      tomorrow: form.tomorrow.value.trim(),
      blockers: form.blockers.value.trim(),
    };

    const reports = loadReports();
    reports.push(report);
    saveReports(reports);
    renderList(reports);
    renderDetail(report);
    resetForm();
  });

  clearButton.addEventListener('click', () => {
    if (!confirm('保存されている日報をすべて削除しますか？')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderList([]);
  });

  renderList(loadReports());
})();
