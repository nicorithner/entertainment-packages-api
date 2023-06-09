const db = require("../db/models");
const Show = db.show;
const Network = db.network;
const Package = db.package;

// Create and Save a new Show
exports.create = async (req, res) => {
  if (!req.body.title || !req.body.imdb_rating) {
    res.status(400).send({
      message: "Content can not be empty",
    });
    return;
  }

  const show = {
    title: req.body.title,
    imdb_rating: req.body.imdb_rating,
    NetworkId: req.body.NetworkId,
  };

  try {
    const newShow = await Show.create(show);
    res.send(newShow);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || `Something went wrong while creating show ${show.name}`,
    });
  }
};

// Retrieve all Shows from the database.
exports.findAll = async (req, res) => {
  let query_network_id = req.query.network_id || null;
  let package_id = req.query.package_id || null;

  console.log("network_id: ", query_network_id);
  console.log("packageId: ", package_id);

  switch (true) {
    case query_network_id != null:
      Show.findAll({
        where: { NetworkId: query_network_id },
        truncate: false,
      })
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Something went wrong while retrieving shows",
          });
        });
      break;

    case package_id != null:
      // 1. get networks associated to the given package id.
      try {
        const package = await Package.findOne({
          where: { id: package_id },
          include: Network,
        });
        const networks = package["Networks"];
        if (networks.length === 0) {
          throw new Error(`Couldn't find any networks in this package`);
        }

        // 2. get shows for those networks
        const shows = [];
        for (const network of networks) {
          let networkShows = await Show.findAll({
            where: { NetworkId: network.id },
          });
          shows.push(...networkShows);
        }
        if (shows.length === 0) {
          throw new Error(`Couldn't find any shows in this network`);
        }
        res.send(shows);
      } catch (err) {
        res.status(500).send({
          message: err.message || "Something went wrong while retrieving shows",
        });
      }
      break;
    default:
      Show.findAll({ where: {}, truncate: false })
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Something went wrong while retrieving shows",
          });
        });
      break;
  }
};

// Find a single Show with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const show = await Show.findByPk(id);
    if (show) {
      res.send(show);
    } else {
      res.status(404).send({
        message: `Cannot find show with id=${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        `Something went wrong while retrieving show with id=${id}`,
    });
  }
};

// Update a Show by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Show.update(req.body, {
      where: { id: id },
    });
    if (num == 1) {
      res.send({
        message: "Show was updated successfully.",
      });
    } else {
      res.send({
        message: `Couldn't update show with id=${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message || `Something went wrong while updating show with id=${id}`,
    });
  }
};

// Delete a Show with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Show.destroy({
      where: { id: id },
    });
    if (num == 1) {
      res.send({
        message: "Show was deleted successfully!",
      });
    } else {
      res.send({
        message: `Couldn't delete show with id=${id}`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || `Couldn't detele show with id=${id}`,
    });
  }
};

// Delete all Shows from the database.
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Show.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${nums} Shows were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all shows.",
    });
  }
};
