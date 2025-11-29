/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * A utility function to measure the elapsed time of a task and provide
 * detailed timing information.
 *
 * This function wraps a given task (callback function) and provides it with
 * a `tracked` object that includes a `print` method. The `print` method can
 * be used within the task to log messages along with the elapsed time
 * since the task started execution. The elapsed time is formatted in milliseconds,
 * seconds, or minutes, based on the duration.
 *
 * @param {Function} task - A callback function to be measured. The function
 *                          is invoked with a `tracked` object as an argument.
 * @return {*} Result of the wrapped callback function. The result of the
 *             `task` callback will be returned unchanged.
 */
module.exports.elapsed = function elapsed(task) {
  const startTime = Date.now();
  return task({
    print: (message) => {
      const duration = Date.now() - startTime;
      let extended;
      if (duration < 1000) {
        extended = `${duration}ms`;
      } else if (duration < 60 * 1000) {
        extended = `${Math.ceil(duration / 1000)}s`;
      } else {
        extended = `${Math.ceil(duration / 3600000)}min`;
      }
      const msg = `${message} in ${extended}`;
      console.info(msg);
      return msg;
    }
  });
};
