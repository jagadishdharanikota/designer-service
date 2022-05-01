const DBManager = require('./db-manager');

/**
 * Method to get all the passed classes and its dependent classes
 * @param {Array.<string>} classNames List of all class names for which itself and depends need to be retrieved
 */
async function getDependentClasses(classNames) {
  let classes = {};
  if (classNames.length === 0) {
    return classes;
  }

  const query = [
    {
      $match: { _id: { $in: classNames } },
    },
    {
      $project: {
        className: 1,
        properties: 1,
        parentClassName: 1,
        referencedClasses: 1,
      },
    },
  ];

  const data = await DBManager.aggregate('classDefinitions', query);
  const nextIterationClasses = [];

  for (const item of data) {
    if (item.referencedClasses.length > 0) {
      nextIterationClasses.push(...item.referencedClasses);
    }
    classes[item.className] = item;
  }

  if (nextIterationClasses.length > 0) {
    const classList = await getDependentClasses(nextIterationClasses);
    classes = {
      ...classes,
      ...classList,
    };
  }
  return classes;
}

/**
 * Method to get all the properties of the passed classes.
 * Iterates and gets the parent class properties also.
 *
 * @param {Object} classes
 */
function getProperties(classes) {
  const allProperties = [];
  for (const { parentClassName, properties } of Object.values(classes)) {
    if (parentClassName === '') {
      return properties.filter((item) => item.objectClass !== '<Dynamic>');
    }

    // Get parent class properties
    allProperties.push(...getProperties({ [parentClassName]: classes[parentClassName] }));

    // Filter all the properties which are not Dynamic references
    allProperties.push(...properties.filter((item) => item.objectClass !== '<Dynamic>'));
    break;
  }
  return allProperties;
}

/**
 *
 * @param {String} className
 * @param {*} classes
 */
function getResolvedObjectProperties(className, classes) {
  const defaultProperties = {};
  const { properties } = classes[className];
  // for (const property of properties) {
  for (let index = 0; index < Object.keys(properties).length; index += 1) {
    const { propertyName, propertyType, objectClass } = properties[index];
    switch (propertyName) {
      case 'key':
        defaultProperties[propertyName] = Date.now().toString();
        break;
      default:
        if (propertyType === 'Object') {
          defaultProperties[propertyName] = getResolvedObjectProperties(objectClass, classes);
        } else if (propertyType === 'List') {
          defaultProperties[propertyName] = [];
        } else {
          defaultProperties[propertyName] = '';
        }
    }
  }
  // }
  return defaultProperties;
}

/**
 * Method to return the class properties
 * @param {*} className Name of the class for which properties should be returned
 */

async function getClassProperties(className) {
  const classes = await getDependentClasses([className]);
  const properties = getProperties(classes);
  const defaultProperties = {};

  // for (const property of properties) {
  const keys = Object.keys(properties);
  for (let index = 0; index < keys.length; index += 1) {
    const { propertyName, propertyType, objectClass } = properties[index];

    if (propertyType === 'Object') {
      defaultProperties[propertyName] = getResolvedObjectProperties(objectClass, classes);
    } else if (propertyType === 'List') {
      defaultProperties[propertyName] = [];
    } else {
      defaultProperties[propertyName] = '';
    }
  }

  const classProperties = {
    ...classes[className],
    properties: { ...defaultProperties },
  };
  return classProperties;
}

module.exports = getClassProperties;
