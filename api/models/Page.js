/**
 * Page.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { generatePageUrl, generateRandomString } = require("../util");
const moment = require("moment");
module.exports = {
  tableName: "pages",
  attributes: {
    user_id: {
      type: "string",
      required: true,
    },
    is_published: {
      type: "boolean",
      defaultsTo: false,
    },
    is_active: {
      type: "boolean",
      defaultsTo: true,
    },
    is_blocked: {
      type: "boolean",
      defaultsTo: false,
    },
    published_at: {
      type: "ref",
      columnType: "datetime",
      required: false,
    },
    deletedAt: {
      type: "ref",
      columnType: "datetime",
      required: false,
    },
    url: {
      type: "string",
      allowNull: true,
    },
    slug: {
      type: "string",
      allowNull: true,
    },
    views: {
      type: "number",
    },
    perfect_pass: {
      type: "boolean",
      defaultsTo: false,
    },
    draft_pages: {
      collection: "draft_page",
      via: "page_id",
    },
    published_pages: {
      collection: "published_page",
      via: "page_id",
    },
    activation: {
      collection: "activations",
      via: "page_id",
    },
    draft_contact_buttons: {
      collection: "draft_page_contact_button",
      via: "page_id",
    },
    published_contact_buttons: {
      collection: "published_page_contact_button",
      via: "page_id",
    },
    draft_links: {
      collection: "draft_page_link",
      via: "page_id",
    },
    published_links: {
      collection: "published_page_link",
      via: "page_id",
    },
    passenable: {
      type: "boolean",
      defaultsTo: false,
    },
    is_deleted: {
      type: "boolean",
      defaultsTo: false,
    },
    // user_id: {
    //   // type: "string",
    //   // required: true,
    //   model: 'user'
    // },
  },
  customToJSON: function () {
    if (this.url) {
      this.url = sails.config.dymedrop.web_url + this.url;
    }
    return _.omit(this, ["createdAt", "updatedAt"]);
  },
  createPage: async function (inputs) {
    try {
      let my_page = await sails
        .getDatastore()
        .transaction(async (db) => {
          let obj = { user_id: inputs.user.id };
          let slug = await sails.helpers.pages.getSlug(inputs.title);
          let page = await Page.create({
            user_id: inputs.user.id,
            slug,
          })
            .fetch()
            .usingConnection(db);
          if (!page) {
            throw new Error("Unable to create page");
          }

          if (page.passenable == "0") {
            const getAdminTemplate = await AdminActivations.find({
              published: 1,
            }).sort("id desc");
            // const promo = generateRandomString();
            let found = null;
            let activation_promocode = generateRandomString();
            do {
              found = await AdminActivations.find({
                where: { activation_promocode },
              }).limit(1);
              if (found.length) {
                activation_promocode = generateRandomString();
              }
            } while (found.length);

            if (getAdminTemplate.length > 0) {
              getAdminTemplate.map(async (e, index) => {
                const code = await generateRandomString(8);
                delete e.id;
                e.user_id = inputs.user.id;
                e.page_id = page.id;
                e.published = 0;
                e.activation_promocode = code.toUpperCase();
              });

              // let data = await getAdminTemplate.map((o)=>{
              //   delete o.id;

              //   return {
              //     user_id :inputs.user.id,
              //     page_id : page.id,
              //     published : 0,
              //     activation_promocode :o.activation_promocode,
              //   }
              // })

              const addActivationOnFirst = await Activations.createEach(
                getAdminTemplate
              ).fetch();
              // if (addActivationOnFirst) {
              //   const setPage = await Page.updateOne({
              //     user_id: inputs.user.id,
              //     id: page.id,
              //   }).set({
              //     passenable: 1,
              //   });
              // }
            }
          }

          obj = {
            page_id: page.id,
            title: inputs.title,
            description: inputs.description,
            screenshot: inputs.screenshot,
            image: inputs.image,
            image_id: inputs.image_id || null,
          };
          let draft_page = await Draft_page.create(obj)
            .fetch()
            .usingConnection(db);
          if (!draft_page) {
            throw new Error("Unable to create page");
          }
          delete draft_page.id;
          delete draft_page.page_id;
          page = _.merge(page, draft_page);
          if (!_.isEmpty(inputs.contact_buttons)) {
            inputs.contact_buttons.page_id = page.id;
            await Draft_page_contact_button.create({
              ...inputs.contact_buttons,
            })
              .fetch()
              .usingConnection(db);
            delete inputs.contact_buttons.page_id;
            page.contact_buttons = inputs.contact_buttons;
          }
          if (!_.isEmpty(inputs.links) && inputs.links.add.length) {
            let links_to_fetch = [];
            for (link of inputs.links.add) {
              let link_to_fetch = { ...link };
              link.page_id = page.id;
              link.action = JSON.stringify(link.action);
              links_to_fetch.push(link_to_fetch);
            }
            let draft_page_links = await Draft_page_link.createEach(
              inputs.links.add
            )
              .fetch()
              .usingConnection(db);
            // page.links = links_to_fetch;
            // page.links = draft_page_links.reverse();
            page.links = _.sortBy(draft_page_links, (o) => o.order);
          }
          return page;
        })
        .intercept("E_INSUFFICIENT_FUNDS", () => "badRequest")
        .intercept("E_NO_SUCH_RECIPIENT", () => "notFound");
      return my_page;
    } catch (err) {
      sails.log.error(`Error in model Page, function createPage. ${err}`);
    }
  },
  updatePage: async function (inputs) {
    try {
      let my_page = await sails
        .getDatastore()
        .transaction(async (db) => {
          let obj = { user_id: inputs.user.id };
          let is_invited;
          let page;
          page = await Page.findOne({
            user_id: inputs.user.id,
            id: inputs.id,
          });
          if (!page) {
            page = await Invitations.findOne({
              page_id: inputs.id,
              // user_id: inputs.user.id,
              email: inputs.user.email,
              is_removed: 0,
            });
            if (!page) {
              throw new Error("Page not found");
            } else {
              is_invited = true;
            }
          } else {
            is_invited = false;
          }
          page = await Page.updateOne({
            // user_id: inputs.user.id,
            id: inputs.id,
          })
            .set({ is_published: false })
            .usingConnection(db);
          if (!page) {
            throw new Error("Unable to update page");
          }
          obj = {
            page_id: inputs.id,
            title: inputs.title,
            description: inputs.description,
            screenshot: inputs.screenshot,
            image: inputs.image,
          };
          if (inputs.image_id) {
            obj.image_id = inputs.image_id;
          }

          let draft_page = await Draft_page.updateOne({ page_id: page.id })
            .set(obj)
            .usingConnection(db);
          if (!draft_page) {
            throw new Error("Unable to update page");
          }
          delete draft_page.id;
          delete draft_page.page_id;
          // let membersQuery = `SELECT page_id , COUNT(*) as members FROM invitations WHERE page_id  AND is_removed = 0  GROUP BY page_id;`;
          let membersQuery = await Invitations.count({
            page_id: inputs.id,
            is_removed: 0,
          });
          // const members = await sails.sendNativeQuery(membersQuery);
          page.members = membersQuery;
          page.invited_page = is_invited;
          page = _.merge(page, draft_page);
          if (!_.isEmpty(inputs.contact_buttons)) {
            inputs.contact_buttons.page_id = page.id;
            await Draft_page_contact_button.destroy({ page_id: page.id });
            await Draft_page_contact_button.create({
              ...inputs.contact_buttons,
            })
              .fetch()
              .usingConnection(db);
            delete inputs.contact_buttons.page_id;
            page.contact_buttons = inputs.contact_buttons;
          }
          if (!_.isEmpty(inputs.links)) {
            let links_to_fetch = [];
            if (
              !_.isUndefined(inputs.links.delete) &&
              inputs.links.delete.length
            ) {
              await Draft_page_link.destroy({ id: inputs.links.delete });
              await Published_page_link.destroy({
                draft_page_link_id: inputs.links.delete,
              });
            }

            if (!_.isUndefined(inputs.links.add) && inputs.links.add.length) {
              for (link of inputs.links.add) {
                let link_to_fetch = { ...link };
                link.page_id = page.id;
                link.action = JSON.stringify(link.action);
              }
              let created_links = await Draft_page_link.createEach(
                inputs.links.add
              )
                .fetch()
                .usingConnection(db);
              links_to_fetch = _.merge(links_to_fetch, created_links);
            }
            if (!_.isUndefined(inputs.links.edit) && inputs.links.edit.length) {
              for (link of inputs.links.edit) {
                let link_to_fetch = { ...link };
                link.page_id = page.id;
                link.action = JSON.stringify(link.action);
                links_to_fetch.push(link_to_fetch);
                let updated_link = await Draft_page_link.update({ id: link.id })
                  .set(link)
                  .usingConnection(db);
              }
            }
            if (
              !_.isUndefined(inputs.links.shuffled) &&
              inputs.links.shuffled.length
            ) {
              for (link of inputs.links.shuffled) {
                let updated_link = await Draft_page_link.update({ id: link.id })
                  .set(link)
                  .usingConnection(db);
              }
            }

            //page.links = await Draft_page_link.find({where:{page_id:page.id}}).sort("id DESC");
          }
          return page;
        })
        .intercept("E_INSUFFICIENT_FUNDS", () => "badRequest")
        .intercept("E_NO_SUCH_RECIPIENT", () => "notFound");
      return my_page;
    } catch (err) {
      sails.log.error(`Error in model Page, function updatePage. ${err}`);
    }
  },
  getPages: async function (filter = { user_id: null }) {
    let data = [];
    try {
      let where = { id: { "!=": null } };
      if (filter.user_id) {
        where.user_id = filter.user_id;
      }
      if (!_.isUndefined(filter.is_deleted)) {
        where.is_deleted = filter.is_deleted;
      }
      let pages = await Page.find({
        where,
        select: [
          "id",
          "published_at",
          "url",
          "is_published",
          "passenable",
          "createdAt",
        ],
      })
        .populate("draft_pages", {
          sort: "id DESC",
        })
        .populate("published_pages", {
          sort: "id DESC",
        })
        .sort("id DESC");

      if (pages.length) {
        for (page of pages) {
          let obj = {
            id: page.id,
            published_at: page.published_at,
            url: sails.config.dymedrop.web_url + page.url,
            is_published: page.is_published,
            passenable: page.passenable,
            createdAt: page.createdAt,
            invited_page: false,
          };
          let detail = page.draft_pages[0];
          obj.screenshot = detail.screenshot;
          obj.image_id = detail.image_id;
          data.push(obj);
        }
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function getPages. ${err}`);
    }
    return data;
  },

  getInvitedPage: async function (filter) {
    let data = [];
    let ownerData;
    try {
      let where = { id: { in: filter.id } };
      if (!_.isUndefined(filter.is_deleted)) {
        where.is_deleted = filter.is_deleted;
      }
      if (!_.isUndefined(filter.data)) {
        ownerData = filter.data;
      }
      let pages = await Page.find({
        where,
        select: [
          "id",
          "published_at",
          "url",
          "is_published",
          "passenable",
          // "createdAt",
        ],
      })
        .populate("draft_pages", {
          sort: "id DESC",
        })
        .populate("published_pages", {
          sort: "id DESC",
        })
        .sort("id DESC");
      if (pages.length) {
        for (page of pages) {
          let obj = {
            id: page.id,
            published_at: page.published_at,
            url: sails.config.dymedrop.web_url + page.url,
            is_published: page.is_published,
            passenable: page.passenable,
            // createdAt : page.createdAt,
            invited_page: true,
          };
          if (ownerData) {
            ownerData.map((e) => {
              if (page.id == e.page_id) {
                obj.owner = e;
                obj.createdAt = e.createdAt;
              }
            });
          }
          let detail = page.draft_pages[0];
          obj.screenshot = detail.screenshot;
          obj.image_id = detail.image_id;
          data.push(obj);
        }
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function getInvitedPage. ${err}`);
    }
    return data;
  },

  getPage: async function (filter) {
    let data = {};
    try {
      let where = { id: { "!=": null } };
      if (filter.id) {
        where.id = filter.id;
      }
      if (filter.slug) {
        where.slug = filter.slug;
      }
      if (filter.user_id) {
        where.user_id = filter.user_id;
      }
      if (!_.isUndefined(filter.is_deleted)) {
        where.is_deleted = filter.is_deleted;
      }
      console.log({ where });
      let page = await Page.findOne({
        where,
        select: [
          "id",
          "published_at",
          "url",
          "is_published",
          "perfect_pass",
          "passenable",
          "slug",
        ],
      })
        .populate("draft_pages")
        .populate("published_pages")
        .populate("draft_contact_buttons")
        .populate("published_contact_buttons")
        .populate("draft_links", {
          sort: "order ASC",
        })
        .populate("published_links", {
          sort: "order ASC",
        });
      if (page) {
        let obj = {
          id: page.id,
          published_at: page.published_at,
          is_published: page.is_published,
          url: sails.config.dymedrop.web_url + page.url,
          passenable: page.passenable,
          slug: page.slug,
        };
        let detail = page.draft_pages[0];
        let contact_buttons = page.draft_contact_buttons[0];
        let links = page.draft_links;
        if (filter.user_id) {
          obj.invited_page = false;
        } else {
          obj.invited_page = true;
          let owner = await Invitations.findOne({
            page_id: page.id,
            email: filter.u_email,
            is_removed: 0,
          });
          if (owner) {
            obj.owner = await User.findOne({
              user_id: owner.page_owner,
            });
          } else {
            return data;
          }
        }
        const actve_activations = await Activations.find({
          page_id: page.id,
          published: 1,
          is_deleted: 0,
        });
        obj.title = detail.title;
        obj.description = detail.description;
        obj.image = detail.image;
        obj.screenshot = detail.screenshot;
        obj.perfect_pass = page.perfect_pass;
        obj.contact_buttons = contact_buttons;
        obj.links = links;
        obj.passenable = page.passenable;
        obj.active_activations = actve_activations.length;

        data = obj;
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function getPage. ${err}`);
    }
    return data;
  },
  getPublishedPage: async function (
    id_or_slug,
    filter_by = "slug",
    is_deleted = null
  ) {
    let data = {};
    try {
      let where = { is_active: true, is_blocked: false };
      if (is_deleted != null) {
        where.is_deleted = is_deleted;
      }
      if (filter_by == "slug") {
        where.slug = id_or_slug;
      } else {
        where.id = id_or_slug;
      }
      let page = await Page.find({
        where,
        select: [
          "id",
          "published_at",
          "url",
          "is_published",
          "perfect_pass",
          "passenable",
          "is_deleted",
          "slug",
        ],
      })
        .populate("published_pages")
        .populate("activation", { published: 1 })
        .populate("published_contact_buttons")
        .populate("published_links", {
          sort: "order ASC",
        })
        .limit(1);
      if (page.length) {
        page = page[0];
        let obj = {
          id: page.id,
          published_at: page.published_at,
          is_published: page.is_published,
          url: sails.config.dymedrop.web_url + page.url,
          slug: page.slug,
        };
        let detail = page.published_pages[0];
        let contact_buttons = page.published_contact_buttons[0];
        let links = page.published_links;
        let activation = page.activation;

        obj.title = detail.title;
        obj.description = detail.description;
        obj.image = detail.image;
        obj.screenshot = detail.screenshot;
        obj.perfect_pass = page.perfect_pass;
        obj.passenable = page.passenable;
        obj.is_deleted = page.is_deleted;
        obj.contact_buttons = contact_buttons;
        obj.links = links;
        obj.activation = activation;

        data = obj;
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function getPublishedPage. ${err}`);
    }
    return data;
  },
  publishPage: async function (id, user_id, email) {
    let data = {};
    let members;
    try {
      let is_invited;
      let where = { id };
      if (user_id) {
        where.user_id = user_id;
      }
      let page;
      page = await Page.findOne({
        where,
      });
      if (!page) {
        page = await Invitations.findOne({
          page_id: id,
          // user_id: user_id,
          email: email,
          is_removed: 0,
        });
        if (!page) {
          throw new Error("Page not found");
        } else {
          is_invited = true;
          delete where.user_id;
          members = await Invitations.count({
            page_id: id,
            is_removed: 0,
          });
        }
      } else {
        is_invited = false;
      }
      page = await Page.findOne({
        where,
        select: ["id", "published_at", "is_published", "slug", "url"],
      })
        .populate("draft_pages")
        .populate("draft_contact_buttons")
        .populate("draft_links", {
          sort: "id DESC",
        });
      if (page) {
        data = await sails.getDatastore().transaction(async (db) => {
          let obj = { user_id };
          if (!page.published_at) {
            page.url = generatePageUrl(page.slug);
          }

          let updated = await Page.updateOne({
            id: page.id,
          })
            .set({
              published_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              is_published: true,
              url: page.url,
            })
            .usingConnection(db);
          page.published_at = updated.published_at;
          page.is_published = true;
          if (!updated) {
            throw new Error("Unable to publish page");
          }
          obj = page.draft_pages[0];
          delete obj.createdAt;
          delete obj.updatedAt;
          delete obj.id;
          delete obj.image_id;
          await Published_page.destroy({ page_id: page.id }).usingConnection(
            db
          );
          let published_page = await Published_page.create(obj)
            .fetch()
            .usingConnection(db);
          if (!published_page) {
            throw new Error("Unable to publish page");
          }
          delete published_page.id;
          delete published_page.page_id;
          //page = _.merge(page, published_page);
          if (
            !_.isEmpty(page.draft_contact_buttons) &&
            !_.isUndefined(page.draft_contact_buttons[0])
          ) {
            obj = page.draft_contact_buttons[0];
            delete obj.createdAt;
            delete obj.updatedAt;
            delete obj.id;
            await Published_page_contact_button.destroy({
              page_id: page.id,
            }).usingConnection(db);
            contact_buttons = await Published_page_contact_button.create(obj)
              .fetch()
              .usingConnection(db);
            page.contact_buttons = contact_buttons;
          }
          if (!_.isEmpty(page.draft_links) && page.draft_links.length) {
            await Published_page_link.destroy({
              page_id: page.id,
              draft_page_link_id: { "!=": _.map(page.draft_links, "id") },
            }).usingConnection(db);
            let links_to_fetch = [];
            let links_to_publish = [];
            for (link of page.draft_links.slice().reverse()) {
              link_to_fetch = link;
              let link_to_publish = {};
              link_to_publish = { ...link };
              link_to_publish.draft_page_link_id = link_to_publish.id;
              delete link_to_publish.createdAt;
              delete link_to_publish.updatedAt;
              delete link_to_publish.id;

              links_to_publish.push(link_to_publish);

              let exist = await Published_page_link.findOne({
                page_id: page.id,
                draft_page_link_id: link_to_publish.draft_page_link_id,
              });
              if (exist) {
                await Published_page_link.updateOne({
                  page_id: page.id,
                  draft_page_link_id: link_to_publish.draft_page_link_id,
                })
                  .set(link_to_publish)
                  .usingConnection(db);
              } else {
                await Published_page_link.create(
                  link_to_publish
                ).usingConnection(db);
              }
            }
            page.links = _.sortBy(page.draft_links, (o) => o.order);
          }

          if (!page.links) {
            page.links = [];
          }

          page.members = members ? members : 0;
          page.title = published_page.title;
          page.description = published_page.description;
          page.screenshot = published_page.screenshot;
          page.image = published_page.image;
          page.perfect_pass = published_page.perfect_pass;
          page.invited_page = is_invited;
          delete page.draft_pages;
          delete page.draft_contact_buttons;
          delete page.draft_links;
          return page;
        });
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function publishPage. ${err}`);
    }
    return data;
  },
  deletePage: async function (id) {
    try {
      let deleted = false;

      deleted = await sails.getDatastore().transaction(async (db) => {
        await Page.updateOne(id).set({ is_deleted: 1 }).usingConnection(db);
        await Draft_page.updateOne({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        await Published_page.updateOne({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        await Draft_page_link.update({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        await Published_page_link.update({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        await Draft_page_contact_button.updateOne({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        await Published_page_contact_button.updateOne({ page_id: id })
          .set({ is_deleted: 1 })
          .usingConnection(db);
        return true;
      });
      return deleted;
    } catch (err) {
      sails.log.error(`Error in model Page, function deletePage. ${err}`);
    }
  },
  getAllPages: async function (pagination) {
    try {
      let page = await Page.find(pagination) //({ select: ["id", "published_at"] })
        .populate("published_pages")
        .populate("published_contact_buttons")
        .populate("published_links");
      // .populate("users")
      return page;
    } catch (err) {
      sails.log.error(`Error in model Page, function getAllPages. ${err}`);
      return false;
    }
  },
  getOnePage: async function (id) {
    try {
      let page = await Page.findOne({ where: { id } })
        .populate("published_pages")
        .populate("published_contact_buttons")
        .populate("published_links");
      // .populate("page_view")
      if (page) {
        return page;
      }
    } catch (err) {
      sails.log.error(`Error in model Page, function getOnePage. ${err}`);
      return false;
    }
  },
  countView: async function (slug) {
    try {
      updated = await sails.getDatastore().transaction(async (db) => {
        updated = await Page.find({ where: { slug }, select: ["views"] }).limit(
          1
        );
        if (!updated.length) {
          return false;
        }
        updated = updated[0];
        let views = updated.views + 1;
        await Page.updateOne({ where: { id: updated.id } }).set({ views });
        return views;
      });
      return updated;
    } catch (err) {
      sails.log.error(`Error in model Page, function countView. ${err}`);
    }
  },
};
