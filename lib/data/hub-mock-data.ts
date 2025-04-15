// Mock data for aircraft at gates
export const MOCK_AIRCRAFT = [
  { id: "AC123", position: [-79.61579, 43.6792], status: "on-time", color: "green" },
  { id: "AC456", position: [-79.61551, 43.6817], status: "on-time", color: "green" },
  { id: "AC789", position: [-79.61261, 43.6789], status: "on-time", color: "green" },
  { id: "AC234", position: [-79.612775, 43.678794], status: "delayed", color: "yellow" },
  { id: "AC567", position: [-79.617726, 43.679159], status: "delayed", color: "yellow" },
  { id: "AC890", position: [-79.61671, 43.68292], status: "cancelled", color: "red" },
]

// Mock data for GSE vehicles
export const GSE_VEHICLES = []

// Toronto Pearson International Airport gate data with coordinates
export const TORONTO_GATES = {
  "Gate:28 ": { coordinates: [-79.616685, 43.683084] },
  "Gate:26": { coordinates: [-79.616598, 43.682791] },
  "Gate:24 ": { coordinates: [-79.616111, 43.682124] },
  "Gate:22 ": { coordinates: [-79.615592, 43.681779] },
  "Gate:20": { coordinates: [-79.615446, 43.681211] },
  "Gate:31 ": { coordinates: [-79.615853, 43.680777] },
  "Gate:33 ": { coordinates: [-79.616438, 43.68056] },
  "Gate:35 ": { coordinates: [-79.616923, 43.680343] },
  "Gate:37 ": { coordinates: [-79.617231, 43.679962] },
  "Gate:39 ": { coordinates: [-79.61759, 43.679707] },
  "Gate:40 ": { coordinates: [-79.617616, 43.679283] },
  "Gate:41 ": { coordinates: [-79.617314, 43.67916] },
  "Gate:42": { coordinates: [-79.617036, 43.67861] },
  "Gate:43": { coordinates: [-79.616918, 43.678724] },
  "Gate:44": { coordinates: [-79.616449, 43.678847] },
  "Gate:45": { coordinates: [-79.616508, 43.678909] },
  "Gate:38": { coordinates: [-79.615941, 43.679183] },
  "Gate:36/F36": { coordinates: [-79.615401, 43.679432] },
  "Gate:34/F34": { coordinates: [-79.615173, 43.67972] },
  "Gate:32/F32": { coordinates: [-79.614975, 43.68004] },
  "Gate:51/F51": { coordinates: [-79.614445, 43.680367] },
  "Gate:53/F53": { coordinates: [-79.613821, 43.680367] },
  "Gate:55/F55": { coordinates: [-79.613235, 43.680211] },
  "Gate:57/F57": { coordinates: [-79.612683, 43.679969] },
  "Gate:61": { coordinates: [-79.612351, 43.679419] },
  "Gate:63": { coordinates: [-79.612469, 43.678893] },
  "Gate:65": { coordinates: [-79.612373, 43.678738] },
  "Gate:69/F69": { coordinates: [-79.612873, 43.677562] },
  "Gate:70": { coordinates: [-79.613391, 43.677287] },
  "Gate:71/F71": { coordinates: [-79.614071, 43.677022] },
  "Gate:72": { coordinates: [-79.613722, 43.676756] },
  "Gate:73": { coordinates: [-79.613393, 43.676417] },
  "Gate:73A": { coordinates: [-79.613342, 43.676457] },
  "Gate:74": { coordinates: [-79.612725, 43.676099] },
  "Gate:75": { coordinates: [-79.611873, 43.675933] },
  "Gate:76": { coordinates: [-79.611247, 43.675976] },
  "Gate:77": { coordinates: [-79.610542, 43.67621] },
  "Gate:78/F78": { coordinates: [-79.609925, 43.676404] },
  "Gate:79/F79": { coordinates: [-79.609489, 43.676754] },
  "Gate:80/F80": { coordinates: [-79.609837, 43.677043] },
  "Gate:81/F81": { coordinates: [-79.610185, 43.677362] },
  "Gate:68/F68": { coordinates: [-79.610837, 43.677679] },
  "Gate:66A": { coordinates: [-79.611033, 43.678059] },
  "Gate:66B": { coordinates: [-79.611104, 43.678327] },
  "Gate:64A": { coordinates: [-79.610935, 43.678717] },
  "Gate:64B": { coordinates: [-79.610918, 43.678963] },
  "Gate:62": { coordinates: [-79.610911, 43.679269] },
  "Gate:60": { coordinates: [-79.610911, 43.679269] },
  "Gate:82": { coordinates: [-79.610347, 43.679983] },
  "Gate:83": { coordinates: [-79.609748, 43.680167] },
  "Gate:99": { coordinates: [-79.608384, 43.680337] },
  "Gate:98": { coordinates: [-79.607986, 43.679968] },
  "Gate:97": { coordinates: [-79.607635, 43.679593] },
  "Gate:96": { coordinates: [-79.607288, 43.679364] },
  "Gate:95": { coordinates: [-79.606946, 43.679176] },
  "Gate:41": { coordinates: [-79.618925, 43.684455] },
  "Gate:40": { coordinates: [-79.619281, 43.684186] },
  "Gate:39": { coordinates: [-79.619376, 43.68384] },
  "Gate:38": { coordinates: [-79.619574, 43.683457] },
  "Gate:37": { coordinates: [-79.619646, 43.683124] },
  "Gate:36": { coordinates: [-79.619706, 43.682501] },
  "Gate:35": { coordinates: [-79.619632, 43.682001] },
  "Gate:34A": { coordinates: [-79.620027, 43.682049] },
  "Gate:34": { coordinates: [-79.620068, 43.681794] },
  "Gate:33": { coordinates: [-79.620458, 43.682043] },
  "Gate:32": { coordinates: [-79.62085, 43.682202] },
  "Gate:31": { coordinates: [-79.621176, 43.682748] },
  "Gate:30A": { coordinates: [-79.621026, 43.683074] },
  "Gate:30": { coordinates: [-79.620928, 43.683186] },
  "Gate:29": { coordinates: [-79.62049, 43.683661] },
  "Gate:28": { coordinates: [-79.620393, 43.683981] },
  "Gate:27": { coordinates: [-79.620148, 43.684478] },
  "Gate:25": { coordinates: [-79.620663, 43.685022] },
  "Gate:24": { coordinates: [-79.621142, 43.685284] },
  "Gate:23": { coordinates: [-79.621608, 43.685592] },
  "Gate:22": { coordinates: [-79.622515, 43.685463] },
  "Gate:20/A20": { coordinates: [-79.623362, 43.685073] },
  "Gate:18/A18": { coordinates: [-79.62403, 43.684632] },
  "Gate:17/A17": { coordinates: [-79.624248, 43.684653] },
  "Gate:16": { coordinates: [-79.624335, 43.684848] },
  "Gate:15": { coordinates: [-79.624523, 43.684982] },
  "Gate:14": { coordinates: [-79.624359, 43.685208] },
  "Gate:13": { coordinates: [-79.62385, 43.685408] },
  "Gate:12": { coordinates: [-79.623487, 43.685692] },
  "Gate:11": { coordinates: [-79.622905, 43.685882] },
  "Gate:9": { coordinates: [-79.622533, 43.686485] },
  "Gate:8": { coordinates: [-79.622699, 43.68713] },
  "Gate:7": { coordinates: [-79.62235, 43.687372] },
}

// Gate timeline data
export const GATE_TIMELINE_DATA = {
  D28: [
    {
      scheduled: {
        arrival: "16:10",
        departure: "20:30",
      },
      actual: {
        arrival: "16:17",
        departure: "20:10",
      },
      flightNumber: "AC 1320",
      aircraft: "CGELU",
    },
    {
      scheduled: {
        arrival: "20:45",
        departure: "01:00",
      },
      actual: {
        arrival: "20:57",
        departure: "01:15",
      },
      flightNumber: "AC 1390",
      aircraft: "CGEXX",
    },
  ],
  D41: [
    {
      scheduled: {
        arrival: "15:30",
        departure: "18:45",
      },
      actual: {
        arrival: "15:42",
        departure: "19:10",
      },
      flightNumber: "AC 456",
      aircraft: "CGHPQ",
    },
  ],
  D32: [
    {
      scheduled: {
        arrival: "16:15",
        departure: "21:30",
      },
      actual: {
        arrival: "16:40",
        departure: "ATD", // Not departed yet
      },
      flightNumber: "AC 234",
      aircraft: "CGTRP",
    },
  ],
  F53: [
    {
      scheduled: {
        arrival: "19:20",
        departure: "23:45",
      },
      actual: {
        arrival: "STA", // Not arrived yet
        departure: "STD", // Not departed yet
      },
      flightNumber: "AC 890",
      aircraft: "CGKFR",
    },
  ],
  D24: [
    {
      scheduled: {
        arrival: "14:15",
        departure: "17:30",
      },
      actual: {
        arrival: "14:20",
        departure: "17:45",
      },
      flightNumber: "AC 721",
      aircraft: "CGWJA",
    },
  ],
  E75: [
    {
      scheduled: {
        arrival: "17:45",
        departure: "22:10",
      },
      actual: {
        arrival: "18:05",
        departure: "22:30",
      },
      flightNumber: "AC 842",
      aircraft: "CGZRM",
    },
  ],
  F67: [
    {
      scheduled: {
        arrival: "13:30",
        departure: "16:15",
      },
      actual: {
        arrival: "13:25",
        departure: "16:10",
      },
      flightNumber: "AC 503",
      aircraft: "CGKVU",
    },
  ],
  E82: [
    {
      scheduled: {
        arrival: "18:50",
        departure: "22:30",
      },
      actual: {
        arrival: "19:15",
        departure: "ATD", // Not departed yet
      },
      flightNumber: "AC 619",
      aircraft: "CGTQB",
    },
  ],
}

// Gate status data
export const GATE_STATUS = {
  D28: {
    aircraft: true,
    passenger: true,
    bags: true,
    tech: true,
  },
  D41: {
    aircraft: true,
    passenger: true,
    bags: false,
    tech: true,
  },
  D32: {
    aircraft: true,
    passenger: false,
    bags: false,
    tech: true,
  },
  F53: {
    aircraft: false,
    passenger: false,
    bags: false,
    tech: false,
  },
  D24: {
    aircraft: true,
    passenger: true,
    bags: true,
    tech: false,
  },
  E75: {
    aircraft: true,
    passenger: true,
    bags: true,
    tech: true,
  },
  F67: {
    aircraft: false,
    passenger: false,
    bags: true,
    tech: true,
  },
  E82: {
    aircraft: true,
    passenger: false,
    bags: false,
    tech: true,
  },
}

// Toronto Pearson International Airport coordinates - focused on Terminal 1
export const TORONTO_PEARSON = {
  center: [-79.616468, 43.679632], // Centered on Terminal 1
  zoom: 17, // Higher zoom level to clearly see gates
  bearing: 15, // Slight rotation for better terminal visibility
}
