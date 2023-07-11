module.exports = function () {
  function createDate(d, h) {
    const locale = "en-US";
    const options = {
      dateStyle: "short",
      timeStyle: "short",
    };
    if (!d && !h) {
      return new Date().toLocaleString(locale, options);
    }
    if (!h) {
      return new Date(Date.now() - 1000 * 60 * 60 * 24 * d).toLocaleString(
        locale,
        options
      );
    }
    return new Date(Date.now() - 1000 * 60 * 60 * h).toLocaleString(
      locale,
      options
    );
  }

  const jarArray = [
    {
      id: "jar1",
      empty: false,
      seed: {
        name: "Clover",
        gramsPerJar: "50",
        gelatinous: "No",
        growTime: "4-5 Days",
        soakTime: "8-10 Hours",
      },
      fillTime: createDate(5),
      wateringLog: [createDate()],
      growDuration: "",
    },
    {
      id: "jar2",
      empty: false,
      seed: {
        name: "Broccoli",
        gramsPerJar: "30",
        gelatinous: "No",
        growTime: "4-5 Days",
        soakTime: "8-10 Hours",
      },
      fillTime: createDate(2),
      wateringLog: [createDate(1)],
      growDuration: "",
    },
    {
      id: "jar3",
      empty: false,
      seed: {
        name: "Green Pea",
        gramsPerJar: "90",
        gelatinous: "No",
        growTime: "3-5 Days",
        soakTime: "8-10 Hours",
      },
      fillTime: createDate(0, 8),
      wateringLog: [createDate(0, 8)],
      growDuration: "",
    },
  ];

  return jarArray;
};
