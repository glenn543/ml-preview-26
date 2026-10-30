window.WIND_SCENES = [
  {
    "id": "lotus",
    "title": "荷花倒影",
    "type": "reflection",
    "video": "assets/loop.mp4?v=c9469c5662e6",
    "videos": [
      {
        "label": "Loop",
        "src": "assets/loop.mp4?v=c9469c5662e6"
      },
      {
        "label": "LoopEcho",
        "src": "assets/loop-echo.mp4?v=3de38b548d06"
      }
    ],
    "mask": null,
    "swayKey": {
      "blue": [
        0.04,
        0.2
      ],
      "dark": [
        0.12,
        0.3
      ],
      "darkWeight": 0.55
    },
    "windAngle": -8,
    "light": [
      -0.35,
      0.9
    ],
    "glintColor": [
      1,
      0.86,
      0.6
    ],
    "duration": 696,
    "music": [
      {
        "src": "assets/main.m4a",
        "label": "主配樂 0930"
      },
      {
        "src": "assets/percussion.mp3",
        "label": "打擊樂 0809",
        "volume": 0.7
      }
    ],
    "keys": {},
    "flute": {
      "times": [
        104.5,
        134,
        153,
        164,
        204,
        222,
        245,
        307,
        336,
        345
      ],
      "ramp": 0.4
    },
    "drums": [
      {
        "t": 50.9,
        "x": 0.25,
        "y": 0.5
      },
      {
        "t": 66.9,
        "x": 0.25,
        "y": 0.5
      },
      {
        "t": 191.1,
        "x": 0.25,
        "y": 0.5
      }
    ],
    "beat": {
      "perBar": 4,
      "map": [
        {
          "from": 0,
          "bpm": 118,
          "offset": 0.465
        },
        {
          "from": 360,
          "off": true
        },
        {
          "from": 400,
          "bpm": 119.99,
          "offset": 0.193
        },
        {
          "from": 600,
          "bpm": 89.9,
          "offset": 0.252
        }
      ]
    },
    "params": {
      "backgroundEcho": 0,
      "wind": 0.35,
      "gustVar": 0.8,
      "gustPace": 0.8,
      "patchSize": 0.5,
      "flow": 0.6,
      "autoRate": 0,
      "autoGust": 0.8,
      "autoSize": 0.35,
      "gust": 1.6,
      "gustSize": 0.4,
      "swirl": 0,
      "echo": 0.6,
      "fade": 0.35,
      "dragLen": 2,
      "echoBlur": 0,
      "distort": 1,
      "chaos": 1,
      "chaosAt": 0.55,
      "soften": 0.6,
      "sway": 0,
      "glint": 0.8,
      "fluteEcho": 0.98,
      "fluteFade": 0,
      "fluteHold": 5.5,
      "fluteRelease": 3,
      "drumSwirl": 0.6
    }
  }
];
