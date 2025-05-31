const { BlocklistModel } = require("../models/blocklist.model");

const normalize = (val = '') => val.toLowerCase().trim();

const addBlockItem = async (req, res) => {
  // Accept either {type, value}  OR  { website:[...], app:[...] }
  let { type, value, website = [], app = [] } = req.body;

  // --- Path A: single add (old behaviour) ------------------------
  if (type && value) {
    website = type === 'website' ? [value] : [];
    app     = type === 'app'     ? [value] : [];
  }

  // --- Path B: bulk arrays ---------------------------------------
  // Merge both arrays into a unified list of {type,value}
  const bulkItems = [
    ...website.map(v => ({ type: 'website', value: normalize(v) })),
    ...app.map(v => ({ type: 'app',     value: normalize(v) }))
  ].filter(i => i.value);               // remove empty strings

  if (bulkItems.length === 0) {
    return res.status(400).send({ message: 'No valid items provided' });
  }

  try {
    /* 1️⃣ Fetch any duplicates that already exist for this user */
    const values      = bulkItems.map(i => i.value);
    const duplicates  = await BlocklistModel.find({
      userId: req.userId,
      value : { $in: values }
    });

    const dupValues = new Set(duplicates.map(d => d.value));

    /* 2️⃣ Filter out duplicates so we only insert new ones */
    const toInsert = bulkItems.filter(i => !dupValues.has(i.value));

    /* 3️⃣ Bulk-insert new docs (if any) */
    let inserted = [];
    if (toInsert.length) {
      inserted = await BlocklistModel.insertMany(
        toInsert.map(i => ({ ...i, userId: req.userId }))
      );
    }

    /* 4️⃣ Return full picture to front-end */
    res.status(201).send({
      message      : 'Blocklist processed',
      inserted,                 // newly added docs
      duplicates                // docs that already existed
    });
  } catch (err) {
    res.status(500).send({ message: 'Failed to add items', error: err.message });
  }
};


/* GET /blocklist  */
const getBlocklist = async (req, res) => {
    try {
        const items = await BlocklistModel.find({ userId: req.userId });
        /* items === []  is perfectly fine for first-time user */
        res.status(200).send(items);
    } catch (err) {
        res.status(500).send({ message: 'Failed to fetch blocklist', error: err.message });
    }
};


/* DELETE /blocklist/:id  */
const deleteBlockItem = async (req, res) => {
    try {
        const removed = await BlocklistModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId    // ensure user owns the item
        });
        if (!removed) return res.status(404).send({ message: 'Item not found' });
        res.status(200).send({ message: 'Removed from blocklist' });
    } catch (err) {
        res.status(500).send({ message: 'Failed to remove', error: err.message });
    }
};

module.exports = { addBlockItem, getBlocklist, deleteBlockItem };
