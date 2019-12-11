"use strict";
const Sequelize = require("sequelize");
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {}

  Post.init(
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      playlist: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      tag: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: "post"
    }
  );

  Post.associate = models => {
    models.Post.belongsTo(models.User);
    models.Post.hasMany(models.Music);
  };
  return Post;
};
