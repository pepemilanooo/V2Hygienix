const { v4: uuidv4 } = require('uuid');

function createId() {
  return uuidv4();
}

function sanitizePagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}

module.exports = { createId, sanitizePagination };
