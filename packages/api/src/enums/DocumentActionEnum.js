const DocumentActionEnum = {
  0: 'Create',
  1: 'Replace',
  2: 'Delete',
  3: 'Transfer',
  4: 'Purchase',
  5: 'Update price',
  6: 'Ignore while bumping revision',
  7: 'Index only delete',
  Create: 0,
  Replace: 1,
  Delete: 2,
  Transfer: 3,
  Purchase: 4,
  UpdatePrice: 5,
  IgnoreWhileBumpingRevision: 6,
  IndexOnlyDelete: 7
}

module.exports = DocumentActionEnum
