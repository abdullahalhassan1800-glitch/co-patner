// Fix for FAT32 drives where Node's fs.readlink throws EISDIR on regular files.
// webpack only tolerates EINVAL/ENOENT/ENOTDIR when probing for symlinks.
const fs = require("fs");

const normalize = (err) => {
  if (err && err.code === "EISDIR") {
    const e = new Error(`EINVAL: illegal operation, readlink on regular file '${err.path}'`);
    e.code = "EINVAL";
    e.path = err.path;
    return e;
  }
  return err;
};

if (typeof fs.readlink === "function" && fs.readlink.__fsFix !== true) {
  const orig = fs.readlink;
  const patched = function (p, opts, cb) {
    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    return orig.call(fs, p, opts, (err, val) => cb(normalize(err), val));
  };
  patched.__fsFix = true;
  fs.readlink = patched;
}

if (typeof fs.readlinkSync === "function" && fs.readlinkSync.__fsFix !== true) {
  const orig = fs.readlinkSync;
  const patched = function (p, opts) {
    try {
      return orig.call(fs, p, opts);
    } catch (err) {
      throw normalize(err);
    }
  };
  patched.__fsFix = true;
  fs.readlinkSync = patched;
}

try {
  if (fs.promises && typeof fs.promises.readlink === "function" && fs.promises.readlink.__fsFix !== true) {
    const orig = fs.promises.readlink;
    const patched = function (p, opts) {
      return orig.call(fs.promises, p, opts).catch((err) => Promise.reject(normalize(err)));
    };
    patched.__fsFix = true;
    fs.promises.readlink = patched;
  }
} catch {}

try {
  const graceful = require("graceful-fs");
  if (graceful && typeof graceful.readlink === "function") {
    const g = graceful.readlink;
    const gpatched = function (p, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      return g.call(graceful, p, opts, (err, val) => cb(normalize(err), val));
    };
    graceful.readlink = gpatched;
  }
} catch {}
