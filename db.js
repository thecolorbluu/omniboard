const sqlite3 = require('better-sqlite3');
const db = new sqlite3("boards.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS emojiBoards (
    emoji TEXT PRIMARY KEY,
    channelID TEXT NOT NULL,
    colors TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS boardMessages (
    messageID TEXT NOT NULL,
    channelID TEXT NOT NULL,
    boardID TEXT NOT NULL,
    PRIMARY KEY (messageID, channelID)
  )
`);

const createBoard = db.prepare(`
  INSERT INTO emojiBoards (emoji, channelID, colors)
  VALUES (?, ?, ?)
`);

const removeBoard = db.prepare(`
  DELETE FROM emojiBoards
  WHERE channelID = ?
`);

const getBoard = db.prepare(`
  SELECT channelID FROM emojiBoards
  WHERE emoji = ?
`);

function boardExists(emoji) {
  return !!getBoard.get(emoji)?.channelID;
}

const addMessage = db.prepare(`
  INSERT INTO boardMessages (messageID, channelID, boardID)
  VALUES (?, ?, ?)
`);

const removeMessage = db.prepare(`
  DELETE FROM boardMessages
  WHERE messageID = ? AND boardID = ?
`);

const getMessage = db.prepare(`
  SELECT boardID FROM boardMessages
  WHERE messageID = ? AND channelID = ?
`);

function messageExists(messageID, channelID) {
  return !!getMessage.get(messageID, channelID)?.boardID;
}

module.exports = {
  db,
  createBoard, removeBoard,
  addMessage, removeMessage,
  getBoard, boardExists,
  getMessage, messageExists
};