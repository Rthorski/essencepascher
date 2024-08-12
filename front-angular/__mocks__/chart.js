module.exports = jest.fn(() => ({
  Chart: jest.fn(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
}));
