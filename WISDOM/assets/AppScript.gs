// ── Wisdom M. Johnson — Scholarship Tracker ──────────────────────────────────
// Google Apps Script backend for _scholarships.html
// Paste this entire file into the Apps Script editor and deploy as a Web App.
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'Sheet1';
const COLS = ['ID', 'Name', 'Amount', 'Date Applied', 'Decision Date', 'Status', 'Notes', 'Link', 'Username', 'Password'];

// Brand colors — match the website exactly
const COLOR = {
  navy:       '#1e3a8a',
  navyDark:   '#162d6b',
  navyLight:  '#2d4fa3',
  gold:       '#f59e0b',
  goldLight:  '#fcd34d',
  white:      '#ffffff',
  gray50:     '#f8fafc',
  gray100:    '#f1f5f9',
  gray200:    '#e2e8f0',
  gray400:    '#94a3b8',
  gray600:    '#475569',
  gray800:    '#1e293b',
  green:      '#16a34a',
  greenBg:    '#dcfce7',
  red:        '#dc2626',
  redBg:      '#fee2e2',
  yellow:     '#ca8a04',
  yellowBg:   '#fef9c3',
  blueBg:     '#dbeafe',
  blueText:   '#1d4ed8',
};

// Column widths (px)
const COL_WIDTHS = [70, 220, 95, 110, 115, 110, 240, 85, 160, 140];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function fmtDate(val) {
  if (!val) return '';
  try { return Utilities.formatDate(new Date(val), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
  catch(e) { return ''; }
}

// ── styleSheet — run once to initialize the spreadsheet ──────────────────────

function styleSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet();

  // ── Spreadsheet-level ────────────────────────────────────────────────────
  ss.rename('Wisdom — Scholarship Tracker');
  sheet.setTabColor(COLOR.gold);
  sheet.setName(SHEET_NAME);

  // Clear everything
  sheet.clearContents();
  sheet.clearFormats();

  // Ensure enough columns
  var maxCols = sheet.getMaxColumns();
  if (maxCols < COLS.length) sheet.insertColumnsAfter(maxCols, COLS.length - maxCols);

  // Column widths
  COL_WIDTHS.forEach(function(w, i) { sheet.setColumnWidth(i + 1, w); });

  // ── Header row ───────────────────────────────────────────────────────────
  var headerRange = sheet.getRange(1, 1, 1, COLS.length);
  headerRange.setValues([COLS]);
  headerRange.setBackground(COLOR.navy);
  headerRange.setFontColor(COLOR.white);
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setFontFamily('Arial');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(false);
  sheet.setRowHeight(1, 38);

  // Gold bottom border on header
  headerRange.setBorder(
    false, false, true, false, false, false,
    COLOR.gold, SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  sheet.setFrozenRows(1);

  // ── Sheet-level formatting ───────────────────────────────────────────────
  // Default font for all data rows
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, COLS.length)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  SpreadsheetApp.flush();
  Logger.log('Sheet styled successfully.');
}

// ── doGet — return all rows as JSON ──────────────────────────────────────────

function doGet() {
  var sheet   = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService
      .createTextOutput('[]')
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data   = sheet.getRange(2, 1, lastRow - 1, COLS.length).getValues();
  var result = data
    .filter(function(row) { return row[0]; })
    .map(function(row) {
      return {
        id:       String(row[0]),
        name:     row[1]  || '',
        amount:   row[2]  || '',
        date:     fmtDate(row[3]),
        decision: fmtDate(row[4]),
        status:   row[5]  || 'pending',
        notes:    row[6]  || '',
        link:     row[7]  || '',
        username: row[8]  || '',
        password: row[9]  || ''
      };
    });

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doPost — receive full array and overwrite sheet ───────────────────────────

function doPost(e) {
  var sheet   = getSheet();
  var entries = JSON.parse(e.postData.contents);

  // Clear existing data rows
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, COLS.length).clearContent();
  if (!entries.length) return ContentService.createTextOutput('ok');

  var rows = entries.map(function(entry) {
    return [
      String(entry.id),
      entry.name     || '',
      entry.amount   || '',
      entry.date     || '',
      entry.decision || '',
      entry.status   || 'pending',
      entry.notes    || '',
      entry.link     || '',
      entry.username || '',
      entry.password || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, COLS.length).setValues(rows);
  styleDataRows(sheet, rows.length);

  return ContentService.createTextOutput('ok');
}

// ── styleDataRows — apply all formatting to data rows ────────────────────────

function styleDataRows(sheet, count) {
  if (count < 1) return;

  for (var i = 0; i < count; i++) {
    var rowNum   = i + 2;
    var rowRange = sheet.getRange(rowNum, 1, 1, COLS.length);
    var isEven   = i % 2 === 0;

    // Alternating row background
    rowRange.setBackground(isEven ? COLOR.gray50 : COLOR.white);
    rowRange.setFontColor(COLOR.gray800);
    rowRange.setFontSize(10);
    rowRange.setFontFamily('Arial');
    rowRange.setVerticalAlignment('middle');
    rowRange.setWrap(false);
    sheet.setRowHeight(rowNum, 32);

    // Thin bottom border between rows
    rowRange.setBorder(
      false, false, true, false, false, false,
      COLOR.gray200, SpreadsheetApp.BorderStyle.SOLID
    );

    // ── Column-specific formatting ──────────────────────────────────────

    // ID col — small, muted
    sheet.getRange(rowNum, 1)
      .setFontColor(COLOR.gray400)
      .setFontSize(9)
      .setHorizontalAlignment('center');

    // Name col — bold, navy
    sheet.getRange(rowNum, 2)
      .setFontWeight('bold')
      .setFontColor(COLOR.navy);

    // Amount col — green bold, right-aligned
    sheet.getRange(rowNum, 3)
      .setFontColor(COLOR.green)
      .setFontWeight('bold')
      .setHorizontalAlignment('right');

    // Date Applied col — centered, muted
    sheet.getRange(rowNum, 4)
      .setFontColor(COLOR.gray600)
      .setHorizontalAlignment('center');

    // Decision Date col — centered
    sheet.getRange(rowNum, 5)
      .setHorizontalAlignment('center');

    // Status col — color coded, centered, bold
    var statusCell = sheet.getRange(rowNum, 6);
    var statusVal  = statusCell.getValue();
    statusCell.setHorizontalAlignment('center').setFontWeight('bold');

    if (statusVal === 'awarded') {
      statusCell.setBackground(COLOR.greenBg).setFontColor(COLOR.green);
    } else if (statusVal === 'not-selected') {
      statusCell.setBackground(COLOR.redBg).setFontColor(COLOR.red);
    } else {
      // pending
      statusCell.setBackground(COLOR.yellowBg).setFontColor(COLOR.yellow);
    }

    // Notes col — wrap, muted
    sheet.getRange(rowNum, 7)
      .setFontColor(COLOR.gray600)
      .setFontSize(9)
      .setWrap(true);

    // Link col — navy, centered
    var linkCell = sheet.getRange(rowNum, 8);
    var linkVal  = linkCell.getValue();
    linkCell.setHorizontalAlignment('center');
    if (linkVal) {
      linkCell.setFontColor(COLOR.navyLight).setFontWeight('bold');
    } else {
      linkCell.setFontColor(COLOR.gray400);
    }

    // Username col — muted, small
    sheet.getRange(rowNum, 9)
      .setFontColor(COLOR.gray600)
      .setFontSize(9);

    // Password col — monospace dots, muted
    sheet.getRange(rowNum, 10)
      .setFontColor(COLOR.gray400)
      .setFontSize(9)
      .setFontFamily('Courier New');
  }

  // ── Decision Date conditional: highlight upcoming within 14 days ──────
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var j = 0; j < count; j++) {
    var decCell = sheet.getRange(j + 2, 5);
    var decVal  = decCell.getValue();
    if (!decVal) continue;

    var decDate  = new Date(decVal);
    var daysAway = Math.ceil((decDate - today) / 86400000);

    if (daysAway >= 0 && daysAway <= 14) {
      // Urgent — gold bg
      decCell.setBackground(COLOR.yellowBg)
             .setFontColor(COLOR.yellow)
             .setFontWeight('bold');
    } else if (daysAway < 0) {
      // Past — muted
      decCell.setFontColor(COLOR.gray400).setFontWeight('normal');
    } else {
      decCell.setFontColor(COLOR.gray800).setFontWeight('normal');
    }
  }

  // ── Outer border around the whole table ──────────────────────────────
  sheet.getRange(1, 1, count + 1, COLS.length)
    .setBorder(
      true, true, true, true, false, false,
      COLOR.gray200, SpreadsheetApp.BorderStyle.SOLID
    );

  SpreadsheetApp.flush();
}
