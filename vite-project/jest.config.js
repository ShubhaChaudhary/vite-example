module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '\\.[jt]sx?$': 'babel-jest'
    },
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/__mocks__/fileMock.js',
      '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js'
    },
    collectCoverage: false,
    collectCoverageFrom: ['src/components/**/*.tsx'],
    coverageReporters: ['json', 'lcov'],
    coverageDirectory: 'jest-coverage',
    reporters: ['default', 'jest-junit']
  };