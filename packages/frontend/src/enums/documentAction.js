export const DocumentActionEnum = {
  0: 'CREATE',
  1: 'REPLACE',
  2: 'DELETE',
  3: 'TRANSFER',
  4: 'UPDATE_PRICE',
  5: 'PURCHASE'
}

export const DocumentActionInfo = {
  CREATE: {
    title: 'Document Create',
    description: 'Creates a new document on the Dash Platform. This action stores the document within the data contract, adhering to the defined schema.',
    color: 'green'
  },
  REPLACE: {
    title: 'Document Replace',
    description: 'Replaces an existing document with a new version. The document is overwritten while maintaining its unique identifier.',
    color: 'orange'
  },
  DELETE: {
    title: 'Document Delete',
    description: 'Deletes an existing document from the Dash Platform. This action removes the document but keeps a traceable record of its deletion.',
    color: 'red'
  },
  TRANSFER: {
    title: 'Document Transfer',
    description: 'Transfers ownership or access rights of a document to another identity. This action facilitates secure exchange of document control.',
    color: 'blue'
  },
  UPDATE_PRICE: {
    title: 'Document Update Price',
    description: 'Sets or updates the price of a document. Turns the document into NFT that could be transferred or sold to other Identity in the system.',
    color: 'blue'
  },
  PURCHASE: {
    title: 'Document Purchase',
    description: 'Purchases a document from the Identity in the Dash Platform. Seller receive credits on the balance of his Identity and ownership is transferred to the buyer.',
    color: 'green'
  }
}
