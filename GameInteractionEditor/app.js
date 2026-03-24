const state = {
  levels: [],
  characters: [],
  selectedLevelId: null,
  selectedAreaId: null,
  selectedEntryId: null,
  selectedResponseId: null
};

function sanitizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\/\\]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}

function getLevelById(id) {
  return state.levels.find(l => l.id === id);
}
function getAreaById(level, id) {
  return level?.areas.find(a => a.id === id);
}
function getEntryById(area, id) {
  return area?.entries.find(e => e.id === id);
}
function getResponseIndex(entry, responseId) {
  if (!entry) return -1;
  return entry.responses.findIndex(r => r.id === responseId);
}

function computeEntryId(levelName, areaName, entryName) {
  return `${sanitizeName(levelName)}_${sanitizeName(areaName)}_${sanitizeName(entryName)}`;
}

function computeResponseId(entryId, responseName, index) {
  return `${entryId}_${sanitizeName(responseName)}_${index}`;
}

function recomputeIds() {
  state.levels.forEach(level => {
    level.id = sanitizeName(level.name);
    level.areas.forEach(area => {
      area.id = `${level.id}_${sanitizeName(area.name)}`;
      area.entries.forEach(entry => {
        entry.id = `${area.id}_${sanitizeName(entry.name)}`;
        const nameGroups = {};
        entry.responses.forEach(resp => {
          if (!nameGroups[resp.name]) nameGroups[resp.name] = [];
          nameGroups[resp.name].push(resp);
        });
        Object.keys(nameGroups).forEach(name => {
          nameGroups[name].forEach((resp, idx) => {
            resp.id = computeResponseId(entry.id, name, idx + 1);
          });
        });
      });
    });
  });
}

function renderLevels() {
  const levelList = document.getElementById('levelList');
  levelList.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'list-root';

  state.levels.forEach(level => {
    const li = document.createElement('li');
    li.className = 'list-item';

    const title = document.createElement('span');
    title.className = 'item-title';
    title.textContent = level.name;

    const buttons = document.createElement('span');
    const selectBtn = document.createElement('button'); selectBtn.textContent = 'Select';
    const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Delete';
    selectBtn.onclick = () => {
      state.selectedLevelId = level.id;
      state.selectedAreaId = null;
      state.selectedEntryId = null;
      state.selectedResponseId = null;
      renderAll();
    };
    deleteBtn.onclick = () => {
      if (!confirm(`Delete level ${level.name}?`)) return;
      state.levels = state.levels.filter(l => l !== level);
      if (state.selectedLevelId === level.id) {
        state.selectedLevelId = null;
        state.selectedAreaId = null;
        state.selectedEntryId = null;
        state.selectedResponseId = null;
      }
      renderAll();
    };
    buttons.appendChild(selectBtn);
    buttons.appendChild(deleteBtn);

    li.appendChild(title);
    li.appendChild(buttons);

    const areaUl = document.createElement('ul');
    areaUl.className = 'nested-list';

    level.areas.forEach(area => {
      const areaLi = document.createElement('li');
      areaLi.className = 'list-item';
      const areaLabel = document.createElement('span');
      areaLabel.textContent = `Area: ${area.name}`;

      const areaBtns = document.createElement('span');
      const selArea = document.createElement('button'); selArea.textContent = 'Select';
      const delArea = document.createElement('button'); delArea.textContent = 'Delete';
      selArea.onclick = () => {
        state.selectedLevelId = level.id;
        state.selectedAreaId = area.id;
        state.selectedEntryId = null;
        state.selectedResponseId = null;
        renderAll();
      };
      delArea.onclick = () => {
        if (!confirm(`Delete area ${area.name}?`)) return;
        level.areas = level.areas.filter(a => a !== area);
        if (state.selectedAreaId === area.id) {
          state.selectedAreaId = null;
          state.selectedEntryId = null;
          state.selectedResponseId = null;
        }
        renderAll();
      };
      areaBtns.appendChild(selArea);
      areaBtns.appendChild(delArea);

      areaLi.appendChild(areaLabel);
      areaLi.appendChild(areaBtns);
      areaUl.appendChild(areaLi);
    });

    const levelControls = document.createElement('div');
    levelControls.className = 'child-actions';
    const addAreaBtn = document.createElement('button');
    addAreaBtn.textContent = 'Add Area';
    addAreaBtn.onclick = () => {
      const name = prompt('Area/Room name');
      if (!name) return;
      const newArea = { id: `${level.id}_${sanitizeName(name)}`, name, entries: [] };
      level.areas.push(newArea);
      recomputeIds();
      renderAll();
    };
    levelControls.appendChild(addAreaBtn);

    li.appendChild(areaUl);
    li.appendChild(levelControls);
    ul.appendChild(li);
  });

  levelList.appendChild(ul);
}

function renderCharacters() {
  const charList = document.getElementById('characterList');
  charList.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'list-root';
  state.characters.forEach(chr => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.textContent = chr.name;
    const del = document.createElement('button');
    del.textContent = 'Del';
    del.onclick = () => {
      state.characters = state.characters.filter(c => c.id !== chr.id);
      renderAll();
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
  charList.appendChild(ul);
}

function renderAreaPanel() {
  const infoPanel = document.getElementById('infoPanel');
  const entryPanel = document.getElementById('entryPanel');

  const level = getLevelById(state.selectedLevelId);
  const area = getAreaById(level, state.selectedAreaId);

  if (!level || !area) {
    infoPanel.classList.remove('hidden');
    entryPanel.classList.add('hidden');
    infoPanel.textContent = 'Choose a level > area in the left panel to view entries.';
    return;
  }

  infoPanel.classList.add('hidden');
  entryPanel.classList.remove('hidden');
  entryPanel.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-section';
  const h3 = document.createElement('h3');
  h3.textContent = `Area: ${area.name}`;
  const path = document.createElement('p');
  path.textContent = `Area ID: ${area.id}`;
  header.appendChild(h3);
  header.appendChild(path);

  const addEntryBtn = document.createElement('button');
  addEntryBtn.textContent = 'Add Entry';
  addEntryBtn.onclick = () => {
    const name = prompt('Entry name (e.g., cell_door)');
    if (!name) return;
    const newEntry = { id: `${area.id}_${sanitizeName(name)}`, name, responses: [] };
    area.entries.push(newEntry);
    recomputeIds();
    renderAll();
  };
  header.appendChild(addEntryBtn);

  entryPanel.appendChild(header);

  area.entries.forEach(entry => {
    const entryCard = document.createElement('div');
    entryCard.className = 'entry-card card-section';

    const entryHeader = document.createElement('div');
    entryHeader.className = 'entry-header';
    const entryTitle = document.createElement('h4');
    entryTitle.textContent = `Entry: ${entry.name} (ID: ${entry.id})`;
    const delEntryBtn = document.createElement('button');
    delEntryBtn.textContent = 'Delete Entry';
    delEntryBtn.onclick = () => {
      if (!confirm(`Delete entry ${entry.name}?`)) return;
      area.entries = area.entries.filter(e => e !== entry);
      renderAll();
    };
    entryHeader.appendChild(entryTitle);
    entryHeader.appendChild(delEntryBtn);

    const responsesWrap = document.createElement('div');
    responsesWrap.className = 'responses-wrap';

    if (entry.responses.length === 0) {
      const noneText = document.createElement('p');
      noneText.textContent = 'No responses yet.';
      responsesWrap.appendChild(noneText);
    } else {
      entry.responses.forEach((resp, index) => {
        const t = document.getElementById('responseCardTemplate').content.cloneNode(true);
        t.querySelector('.response-id').textContent = resp.id;
        t.querySelector('.resp-name').textContent = resp.name;
        t.querySelector('.resp-character').textContent = resp.characterId ? (state.characters.find(c => c.id === resp.characterId)?.name || '(unknown)') : '(none)';
        t.querySelector('.resp-text').textContent = resp.text;
        t.querySelector('.resp-audio').textContent = resp.audioPath || '(none)';
        const editBtn = t.querySelector('.edit-response');
        const deleteBtn = t.querySelector('.delete-response');

        editBtn.onclick = () => {
          // Populate the form in this entry card
          const card = editBtn.closest('.entry-card');
          const form = card.querySelector('.response-form');
          const nameIn = form.querySelector('input[placeholder*="name"]');
          const charSel = form.querySelector('select');
          const textAr = form.querySelector('textarea');
          const audioIn = form.querySelector('input[placeholder*="audio"]');
          const btn = form.querySelector('button');

          nameIn.value = resp.name;
          charSel.value = resp.characterId || '';
          textAr.value = resp.text;
          audioIn.value = resp.audioPath || '';
          btn.textContent = 'Update Response';
          btn.onclick = () => {
            const name = nameIn.value.trim();
            const text = textAr.value.trim();
            if (!name || !text) {
              alert('Response name and text cannot be empty.');
              return;
            }
            resp.name = name;
            resp.text = text;
            resp.characterId = charSel.value || null;
            resp.audioPath = audioIn.value.trim() || '';
            recomputeIds();
            nameIn.value = '';
            textAr.value = '';
            audioIn.value = '';
            charSel.value = '';
            btn.textContent = 'Add Response';
            btn.onclick = () => {
              const name2 = nameIn.value.trim();
              const text2 = textAr.value.trim();
              if (!name2 || !text2) {
                alert('Response name and text cannot be empty.');
                return;
              }
              const response = {
                id: '',
                name: name2,
                text: text2,
                characterId: charSel.value || null,
                audioPath: audioIn.value.trim() || ''
              };
              entry.responses.push(response);
              recomputeIds();
              nameIn.value = '';
              textAr.value = '';
              audioIn.value = '';
              charSel.value = '';
              renderAll();
            };
            renderAll();
          };
        };
        deleteBtn.onclick = () => {
          if (!confirm(`Delete response ${resp.id}?`)) return;
          entry.responses.splice(index, 1);
          recomputeIds();
          renderAll();
        };
        responsesWrap.appendChild(t);
      });
    }

    const form = document.createElement('div');
    form.className = 'response-form';
    const formHeader = document.createElement('h5');
    formHeader.textContent = 'Add/Edit Response';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Response name (e.g., examine)';
    nameInput.className = 'form-input';

    const karakter = document.createElement('select');
    karakter.className = 'form-select';
    const emptyOption = document.createElement('option');
    emptyOption.value = ''; emptyOption.textContent = '-- select optional character --';
    karakter.appendChild(emptyOption);
    state.characters.forEach(c => {
      const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; karakter.appendChild(opt);
    });

    const textArea = document.createElement('textarea');
    textArea.placeholder = 'Display text for this response';
    textArea.className = 'textarea-small';

    const audioInput = document.createElement('input');
    audioInput.type = 'text';
    audioInput.placeholder = 'Audio file path (optional)';
    audioInput.className = 'form-input';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Response';
    addBtn.onclick = () => {
      const name = nameInput.value.trim();
      const text = textArea.value.trim();
      if (!name || !text) {
        alert('Response name and text cannot be empty.');
        return;
      }
      const response = {
        id: '',
        name,
        text,
        characterId: karakter.value || null,
        audioPath: audioInput.value.trim() || ''
      };
      entry.responses.push(response);
      recomputeIds();
      nameInput.value = '';
      textArea.value = '';
      audioInput.value = '';
      karakter.value = '';
      renderAll();
    };

    form.appendChild(formHeader);
    form.appendChild(nameInput);
    form.appendChild(karakter);
    form.appendChild(textArea);
    form.appendChild(audioInput);
    form.appendChild(addBtn);

    entryCard.appendChild(entryHeader);
    entryCard.appendChild(responsesWrap);
    entryCard.appendChild(form);
    entryPanel.appendChild(entryCard);
  });
}

function driveResponseForm(entry, response) {
  const textArea = document.getElementById('responseText');
  const audioInput = document.getElementById('responseAudio');
  const karakter = document.getElementById('responseCharacter');

  if (!textArea || !audioInput || !karakter) return;

  textArea.value = response.text;
  audioInput.value = response.audioPath || '';
  karakter.value = response.characterId || '';

  const addBtn = [...document.querySelectorAll('#entryPanel button')].find(btn => btn.textContent === 'Add Response');
  if (!addBtn) return;

  addBtn.textContent = 'Update Response';
  addBtn.onclick = () => {
    const text = textArea.value.trim();
    if (!text) {
      alert('Response text cannot be empty.');
      return;
    }
    response.text = text;
    response.audioPath = audioInput.value.trim();
    response.characterId = karakter.value || null;
    recomputeIds();
    addBtn.textContent = 'Add Response';
    addBtn.onclick = () => {
      const text2 = textArea.value.trim();
      if (!text2) {
        alert('Response text cannot be empty.');
        return;
      }
      const newResponse = {
        id: '',
        text: text2,
        characterId: karakter.value || null,
        audioPath: audioInput.value.trim() || ''
      };
      entry.responses.push(newResponse);
      recomputeIds();
      textArea.value = '';
      audioInput.value = '';
      karakter.value = '';
      renderAll();
    };
    textArea.value = '';
    audioInput.value = '';
    karakter.value = '';
    renderAll();
  };
function exportAllLevels() {
  if (state.levels.length === 0) {
    alert('No levels to export.');
    return;
  }

  state.levels.forEach(level => {
    const structure = {
      level: {
        name: level.name,
        id: level.id,
        areas: level.areas.map(area => ({
          name: area.name,
          id: area.id,
          entries: area.entries.map(entry => ({
            name: entry.name,
            id: entry.id,
            responses: entry.responses.map(resp => ({
              id: resp.id,
              name: resp.name
            }))
          }))
        }))
      },
      characters: state.characters
    };
    const localization = {};
    level.areas.forEach(area => {
      area.entries.forEach(entry => {
        entry.responses.forEach(resp => {
          localization[resp.id] = {
            text: resp.text,
            characterId: resp.characterId,
            audioPath: resp.audioPath
          };
        });
      });
    });

    const structureBlob = new Blob([JSON.stringify(structure, null, 2)], { type: 'application/json' });
    const localizationBlob = new Blob([JSON.stringify(localization, null, 2)], { type: 'application/json' });

    const dlStruct = document.createElement('a');
    dlStruct.href = URL.createObjectURL(structureBlob);
    dlStruct.download = `${level.id}_structure.json`;
    dlStruct.click();

    const dlLoc = document.createElement('a');
    dlLoc.href = URL.createObjectURL(localizationBlob);
    dlLoc.download = `${level.id}_localization.json`;
    dlLoc.click();
  });
}

function importStructureFile(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!parsed || !parsed.level) throw new Error('Invalid structure file');
      const lv = parsed.level;
      const existingIndex = state.levels.findIndex(l => l.id === sanitizeName(lv.name));
      const record = {
        name: lv.name,
        id: sanitizeName(lv.name),
        areas: (lv.areas || []).map(a => ({
          name: a.name,
          id: `${sanitizeName(lv.name)}_${sanitizeName(a.name)}`,
          entries: (a.entries || []).map(e => ({
            name: e.name,
            id: `${sanitizeName(lv.name)}_${sanitizeName(a.name)}_${sanitizeName(e.name)}`,
            responses: (e.responses || []).map(r => ({
              id: r.id,
              name: r.name,
              text: '', // text comes from localization
              characterId: null,
              audioPath: ''
            }))
          }))
        }))
      };
      if (existingIndex >= 0) state.levels[existingIndex] = record;
      else state.levels.push(record);
      if (parsed.characters) state.characters = parsed.characters;
      recomputeIds();
      renderAll();
      alert(`Imported level ${record.name}`);
    } catch (error) {
      console.error(error);
      alert('Failed to import structure JSON: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  recomputeIds();
  renderLevels();
  renderCharacters();
  renderAreaPanel();
}

function init() {
  document.getElementById('addLevelBtn').onclick = () => {
    const nameInput = document.getElementById('newLevelName');
    const name = nameInput.value.trim();
    if (!name) { alert('Level name required'); return; }
    if (state.levels.some(l => l.name.toLowerCase() === name.toLowerCase())) { alert('Level name exists'); return; }
    state.levels.push({ name, id: sanitizeName(name), areas: [] });
    nameInput.value = '';
    renderAll();
  };

  document.getElementById('addCharacterBtn').onclick = () => {
    const charInput = document.getElementById('newCharacterName');
    const name = charInput.value.trim();
    if (!name) { alert('Character name required'); return; }
    if (state.characters.some(c => c.name.toLowerCase() === name.toLowerCase())) { alert('Character exists'); return; }
    state.characters.push({ name, id: sanitizeName(name) });
    charInput.value = '';
    renderAll();
  };

  document.getElementById('exportAllBtn').onclick = exportAllLevels;

  const importFile = document.getElementById('importJsonFile');
  importFile.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    importStructureFile(f);
    importFile.value = '';
  };

  renderAll();
}

init();
