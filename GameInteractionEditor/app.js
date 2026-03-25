const state = {
  levels: [],
  characters: [],
  selectedLevelId: null,
  selectedAreaId: null,
  selectedEntryId: null,
  selectedResponseId: null,
  selectedNodeId: null
};

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function makeDraggable(element, obj) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(element.style.left, 10);
    startTop = parseInt(element.style.top, 10);
    element.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.style.left = (startLeft + dx) + 'px';
    element.style.top = (startTop + dy) + 'px';
    obj.x = startLeft + dx;
    obj.y = startTop + dy;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
    }
  });
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

  if (state.levels.length === 0) {
    levelList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; margin: 10px 0;">No levels yet. Add one above.</p>';
    return;
  }

  state.levels.forEach(level => {
    const levelContainer = document.createElement('div');
    levelContainer.className = 'level-container';

    // Level header with collapse/expand
    const levelHeader = document.createElement('div');
    levelHeader.className = `level-header ${state.selectedLevelId === level.id ? 'active' : ''}`;
    levelHeader.style.cursor = 'pointer';
    
    const levelTitle = document.createElement('div');
    levelTitle.className = 'level-title';
    levelTitle.textContent = `📍 ${level.name}`;
    
    const areaCount = document.createElement('span');
    areaCount.className = 'area-count';
    areaCount.textContent = `${level.areas.length} area${level.areas.length !== 1 ? 's' : ''}`;
    
    const levelButtonsDiv = document.createElement('div');
    levelButtonsDiv.className = 'level-buttons';
    levelButtonsDiv.onclick = e => e.stopPropagation();
    
    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Open';
    selectBtn.onclick = () => {
      state.selectedLevelId = level.id;
      state.selectedAreaId = null;
      renderAll();
    };
    
    const addAreaBtn = document.createElement('button');
    addAreaBtn.textContent = '+';
    addAreaBtn.title = 'Add Area';
    addAreaBtn.onclick = () => {
      const name = prompt('Area/Room name');
      if (!name) return;
      const newArea = { id: `${level.id}_${sanitizeName(name)}`, name, entries: [] };
      level.areas.push(newArea);
      recomputeIds();
      renderAll();
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete Level';
    deleteBtn.style.background = 'var(--accent-orange)';
    deleteBtn.style.borderColor = 'var(--accent-orange)';
    deleteBtn.onclick = () => {
      if (!confirm(`Delete level ${level.name}?`)) return;
      state.levels = state.levels.filter(l => l !== level);
      if (state.selectedLevelId === level.id) {
        state.selectedLevelId = null;
        state.selectedAreaId = null;
      }
      renderAll();
    };
    
    levelButtonsDiv.appendChild(selectBtn);
    levelButtonsDiv.appendChild(addAreaBtn);
    levelButtonsDiv.appendChild(deleteBtn);
    
    levelHeader.appendChild(levelTitle);
    levelHeader.appendChild(areaCount);
    levelHeader.appendChild(levelButtonsDiv);
    
    // Area list (collapsible)
    const areasDiv = document.createElement('div');
    areasDiv.className = 'areas-list';
    
    if (state.selectedLevelId === level.id) {
      level.areas.forEach(area => {
        const areaItem = document.createElement('div');
        areaItem.className = `area-item ${state.selectedAreaId === area.id ? 'active' : ''}`;
        
        const areaName = document.createElement('div');
        areaName.className = 'area-name';
        areaName.textContent = `📂 ${area.name}`;
        
        const entryCount = document.createElement('span');
        entryCount.className = 'entry-count';
        entryCount.textContent = `${area.entries.length}`;
        
        const areaButtonsDiv = document.createElement('div');
        areaButtonsDiv.className = 'area-buttons';
        areaButtonsDiv.onclick = e => e.stopPropagation();
        
        const selectAreaBtn = document.createElement('button');
        selectAreaBtn.textContent = 'View';
        selectAreaBtn.onclick = () => {
          state.selectedLevelId = level.id;
          state.selectedAreaId = area.id;
          renderAll();
        };
        
        const deleteAreaBtn = document.createElement('button');
        deleteAreaBtn.textContent = '×';
        deleteAreaBtn.style.background = 'var(--accent-orange)';
        deleteAreaBtn.style.borderColor = 'var(--accent-orange)';
        deleteAreaBtn.onclick = () => {
          if (!confirm(`Delete area ${area.name}?`)) return;
          level.areas = level.areas.filter(a => a !== area);
          if (state.selectedAreaId === area.id) {
            state.selectedAreaId = null;
          }
          renderAll();
        };
        
        areaButtonsDiv.appendChild(selectAreaBtn);
        areaButtonsDiv.appendChild(deleteAreaBtn);
        
        areaItem.appendChild(areaName);
        areaItem.appendChild(entryCount);
        areaItem.appendChild(areaButtonsDiv);
        areasDiv.appendChild(areaItem);
      });
    }
    
    levelContainer.appendChild(levelHeader);
    levelContainer.appendChild(areasDiv);
    levelList.appendChild(levelContainer);
  });
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
    const newEntry = { id: `${area.id}_${sanitizeName(name)}`, name, responses: [], x: 100, y: 100 };
    area.entries.push(newEntry);
    recomputeIds();
    renderAll();
  };
  header.appendChild(addEntryBtn);

  entryPanel.appendChild(header);

  const viewport = document.createElement('div');
  viewport.className = 'viewport';
  viewport.style.position = 'relative';
  viewport.style.width = '100%';
  viewport.style.height = '600px';
  viewport.style.overflow = 'auto';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  viewport.appendChild(svg);

  area.entries.forEach(entry => {
    if (!entry.x) entry.x = 100;
    if (!entry.y) entry.y = 100;

    const entryNode = document.createElement('div');
    entryNode.className = 'node entry-node';
    if (state.selectedNodeId === entry.id) entryNode.classList.add('selected');
    entryNode.style.left = entry.x + 'px';
    entryNode.style.top = entry.y + 'px';
    entryNode.textContent = entry.name;
    entryNode.onclick = () => {
      state.selectedNodeId = entry.id;
      renderAll();
    };
    makeDraggable(entryNode, entry);

    viewport.appendChild(entryNode);

    entry.responses.forEach(resp => {
      if (!resp.x) resp.x = entry.x + 200;
      if (!resp.y) resp.y = entry.y + Math.random() * 100;

      const respNode = document.createElement('div');
      respNode.className = 'node response-node';
      if (state.selectedNodeId === resp.id) respNode.classList.add('selected');
      respNode.style.left = resp.x + 'px';
      respNode.style.top = resp.y + 'px';
      respNode.textContent = resp.name;
      respNode.onclick = () => {
        state.selectedNodeId = resp.id;
        renderAll();
      };
      makeDraggable(respNode, resp);

      viewport.appendChild(respNode);

      // Draw line from entry to response
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', entry.x + 50);
      line.setAttribute('y1', entry.y + 25);
      line.setAttribute('x2', resp.x + 50);
      line.setAttribute('y2', resp.y + 25);
      line.setAttribute('stroke', '#444c56');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
    });
  });

  entryPanel.appendChild(viewport);

  // Details panel
  const selected = area.entries.find(e => e.id === state.selectedNodeId) || area.entries.flatMap(e => e.responses).find(r => r.id === state.selectedNodeId);
  if (selected) {
    const details = document.createElement('div');
    details.className = 'card-section';
    const detailsTitle = document.createElement('h3');
    detailsTitle.textContent = `Selected: ${selected.name}`;
    const detailsId = document.createElement('p');
    detailsId.innerHTML = `<strong>ID:</strong> ${selected.id}`;
    const clearSel = document.createElement('button');
    clearSel.textContent = 'Clear selected';
    clearSel.onclick = () => { state.selectedNodeId = null; renderAll(); };

    details.appendChild(detailsTitle);
    details.appendChild(detailsId);
    details.appendChild(clearSel);

    if (selected.responses) {
      // It's an entry
      const responseList = document.createElement('div');
      responseList.className = 'responses-wrap';
      selected.responses.forEach(resp => {
        const card = document.createElement('div');
        card.className = 'response-card';
        card.innerHTML = `<div class='response-card-header'><strong>${resp.id}</strong><span class='response-actions'></span></div>`;

        const body = document.createElement('div');
        body.className = 'response-body';
        body.innerHTML = `<div><strong>Name:</strong> ${resp.name}</div>` +
                         `<div><strong>Character:</strong> ${resp.characterId ? (state.characters.find(c => c.id===resp.characterId)?.name || '(unknown)') : '(none)'}</div>` +
                         `<div><strong>Text:</strong> ${resp.text}</div>` +
                         `<div><strong>Audio:</strong> ${resp.audioPath || '(none)'}</div>`;

        const actionArea = card.querySelector('.response-actions');
        const edit = document.createElement('button'); edit.textContent = 'Edit';
        const remove = document.createElement('button'); remove.textContent = 'Delete';

        edit.onclick = () => {
          nameField.value = resp.name;
          charField.value = resp.characterId || '';
          textField.value = resp.text;
          audioField.value = resp.audioPath || '';
          actionButton.textContent = 'Update Response';
          editingResponse = resp;
        };

        remove.onclick = () => {
          if (!confirm(`Delete response ${resp.id}?`)) return;
          selected.responses.splice(selected.responses.indexOf(resp), 1);
          recomputeIds();
          renderAll();
        };

        actionArea.appendChild(edit);
        actionArea.appendChild(remove);
        card.appendChild(body);
        responseList.appendChild(card);
      });

      details.appendChild(responseList);

      const form = document.createElement('div');
      form.className = 'response-form';

      const formHeader = document.createElement('h5');
      formHeader.textContent = 'Add / Edit Response';

      const nameField = document.createElement('input');
      nameField.type = 'text';
      nameField.placeholder = 'Response name (examine/success)';
      nameField.className = 'form-input';

      const charField = document.createElement('select');
      charField.className = 'form-select';
      const blankOpt = document.createElement('option');
      blankOpt.value = '';
      blankOpt.textContent = '-- optional character --';
      charField.appendChild(blankOpt);
      state.characters.forEach(ch => {
        const o = document.createElement('option');
        o.value = ch.id;
        o.textContent = ch.name;
        charField.appendChild(o);
      });

      const textField = document.createElement('textarea');
      textField.className = 'textarea-small';
      textField.placeholder = 'Response display text';

      const audioField = document.createElement('input');
      audioField.type = 'text';
      audioField.placeholder = 'Audio path (optional)';
      audioField.className = 'form-input';

      let editingResponse = null;

      const actionButton = document.createElement('button');
      actionButton.textContent = 'Add Response';

      actionButton.onclick = () => {
        const nameValue = nameField.value.trim();
        const textValue = textField.value.trim();
        if (!nameValue || !textValue) {
          alert('Response name and text required');
          return;
        }

        if (editingResponse) {
          editingResponse.name = nameValue;
          editingResponse.text = textValue;
          editingResponse.characterId = charField.value || null;
          editingResponse.audioPath = audioField.value.trim() || '';
          editingResponse = null;
          actionButton.textContent = 'Add Response';
        } else {
          selected.responses.push({
            id: '',
            name: nameValue,
            text: textValue,
            characterId: charField.value || null,
            audioPath: audioField.value.trim() || '',
            x: selected.x + 200,
            y: selected.y + Math.random() * 100
          });
        }

        nameField.value = '';
        textField.value = '';
        charField.value = '';
        audioField.value = '';

        recomputeIds();
        renderAll();
      };

      form.appendChild(formHeader);
      form.appendChild(nameField);
      form.appendChild(charField);
      form.appendChild(textField);
      form.appendChild(audioField);
      form.appendChild(actionButton);

      details.appendChild(form);
    } else {
      // It's a response
      const body = document.createElement('div');
      body.className = 'response-body';
      body.innerHTML = `<div><strong>Name:</strong> ${selected.name}</div>` +
                       `<div><strong>Character:</strong> ${selected.characterId ? (state.characters.find(c => c.id===selected.characterId)?.name || '(unknown)') : '(none)'}</div>` +
                       `<div><strong>Text:</strong> ${selected.text}</div>` +
                       `<div><strong>Audio:</strong> ${selected.audioPath || '(none)'}</div>`;
      details.appendChild(body);
    }

    entryPanel.appendChild(details);
  }
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
}

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
            x: entry.x,
            y: entry.y,
            responses: entry.responses.map(resp => ({
              id: resp.id,
              name: resp.name,
              x: resp.x,
              y: resp.y
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

function importLocalizationFile(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const localization = JSON.parse(event.target.result);
      if (!localization || typeof localization !== 'object') throw new Error('Invalid localization file');
      
      let mergedCount = 0;
      state.levels.forEach(level => {
        level.areas.forEach(area => {
          area.entries.forEach(entry => {
            entry.responses.forEach(response => {
              if (localization[response.id]) {
                response.text = localization[response.id].text || '';
                response.characterId = localization[response.id].characterId || null;
                response.audioPath = localization[response.id].audioPath || '';
                mergedCount++;
              }
            });
          });
        });
      });
      
      renderAll();
      alert(`Merged ${mergedCount} localization entries`);
    } catch (error) {
      console.error(error);
      alert('Failed to import localization JSON: ' + error.message);
    }
  };
  reader.readAsText(file);
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
            x: e.x || 100,
            y: e.y || 100,
            responses: (e.responses || []).map(r => ({
              id: r.id,
              name: r.name,
              text: '', // text comes from localization
              characterId: null,
              audioPath: '',
              x: r.x || 200,
              y: r.y || 200
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
    const newLevel = { name, id: sanitizeName(name), areas: [] };
    state.levels.push(newLevel);
    state.selectedLevelId = newLevel.id;
    state.selectedAreaId = null;
    state.selectedNodeId = null;
    nameInput.value = '';
    alert('Level added: ' + name);
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

  const importLocFile = document.getElementById('importLocalizationFile');
  importLocFile.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    importLocalizationFile(f);
    importLocFile.value = '';
  };

  renderAll();
}

init();
