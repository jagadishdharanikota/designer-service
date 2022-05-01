const routesMetadata = {
  showPortal: {
    path: '/portals/:_id',
    method: 'GET',
  },
  /*
  showPortal: {
    path: '/portals/:_id',
    method: 'PATCH',
  },

  */
  createPage: {
    path: '/pages/:_id',
    method: 'PUT',
  },
  showPage: {
    path: '/pages/:_id',
    method: 'GET',
  },
  createView: {
    path: '/views/:_id',
    method: 'PUT',
  },
  showView: {
    path: '/views/:_id',
    method: 'GET',
  },
  getClassDefinition: {
    path: '/classdefinitions/:_id',
    method: 'PUT',
  },
};

module.exports = routesMetadata;
