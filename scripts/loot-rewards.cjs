// Official reward tables, transcribed from the bundled rulebooks.
module.exports={
  "atnas": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 2,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Hide",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 3,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 2
                }
              ]
            },
            {
              "min": 7,
              "max": null,
              "steps": [
                {
                  "op": "note",
                  "text": "营地获得 2 人口，他们获得新生儿的增益。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 2,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Hide",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 3,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 3
                }
              ]
            },
            {
              "min": 7,
              "max": null,
              "steps": [
                {
                  "op": "note",
                  "text": "营地获得 3 人口，他们获得新生儿的增益。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 2,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Hide",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 3,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 4
                }
              ]
            },
            {
              "min": 7,
              "max": null,
              "steps": [
                {
                  "op": "note",
                  "text": "营地获得 4 人口，他们获得新生儿的增益。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "black-knight": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Black Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "获得下一级挑战之钟发明；结算 Darkened Workshop。集体劳作等奖励见原图。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败黑骑士？",
          "type": "boolean"
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Black Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "获得下一级挑战之钟发明；结算 Darkened Workshop。集体劳作等奖励见原图。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败黑骑士？",
          "type": "boolean"
        }
      ]
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Black Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "获得下一级挑战之钟发明；结算 Darkened Workshop。集体劳作等奖励见原图。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败黑骑士？",
          "type": "boolean"
        }
      ]
    }
  },
  "bone-eaters": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "repeat",
          "count": {
            "input": "kills"
          },
          "steps": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "奖励骰",
              "rows": [
                {
                  "min": 1,
                  "max": 6,
                  "steps": []
                },
                {
                  "min": 7,
                  "max": 9,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    }
                  ]
                },
                {
                  "min": 10,
                  "max": 10,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    },
                    {
                      "op": "if",
                      "key": "scalpelAvailable",
                      "yes": [
                        {
                          "op": "take",
                          "name": "Royal Scalpel",
                          "count": 1,
                          "once": true
                        }
                      ],
                      "no": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "op": "take",
          "name": "Perfect Bone",
          "count": 1
        },
        {
          "op": "note",
          "text": "其他幸存者奖励和后续狩猎选择见原图。"
        }
      ],
      "inputs": [
        {
          "key": "kills",
          "label": "本次实际击败的食骨者数量",
          "type": "number",
          "min": 0,
          "max": 5
        },
        {
          "key": "scalpelAvailable",
          "label": "本战役是否尚未通过此奖励获得皇家解剖刀？",
          "type": "boolean"
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "repeat",
          "count": {
            "input": "kills"
          },
          "steps": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "奖励骰",
              "rows": [
                {
                  "min": 1,
                  "max": 6,
                  "steps": []
                },
                {
                  "min": 7,
                  "max": 9,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    }
                  ]
                },
                {
                  "min": 10,
                  "max": 10,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    },
                    {
                      "op": "if",
                      "key": "scalpelAvailable",
                      "yes": [
                        {
                          "op": "take",
                          "name": "Royal Scalpel",
                          "count": 1,
                          "once": true
                        }
                      ],
                      "no": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "op": "take",
          "name": "Shawl of Determination",
          "count": 1
        },
        {
          "op": "note",
          "text": "其他幸存者奖励和后续狩猎选择见原图。"
        }
      ],
      "inputs": [
        {
          "key": "kills",
          "label": "本次实际击败的食骨者数量",
          "type": "number",
          "min": 0,
          "max": 5
        },
        {
          "key": "scalpelAvailable",
          "label": "本战役是否尚未通过此奖励获得皇家解剖刀？",
          "type": "boolean"
        }
      ]
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "repeat",
          "count": {
            "input": "kills"
          },
          "steps": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "奖励骰",
              "rows": [
                {
                  "min": 1,
                  "max": 6,
                  "steps": []
                },
                {
                  "min": 7,
                  "max": 9,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    }
                  ]
                },
                {
                  "min": 10,
                  "max": 10,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    },
                    {
                      "op": "if",
                      "key": "scalpelAvailable",
                      "yes": [
                        {
                          "op": "take",
                          "name": "Royal Scalpel",
                          "count": 1,
                          "once": true
                        }
                      ],
                      "no": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "op": "take",
          "name": "Royal Decorations",
          "count": 1
        },
        {
          "op": "note",
          "text": "获得皇家饰品的幸存者还获得“饥不择食”损伤。"
        }
      ],
      "inputs": [
        {
          "key": "kills",
          "label": "本次实际击败的食骨者数量",
          "type": "number",
          "min": 0,
          "max": 5
        },
        {
          "key": "scalpelAvailable",
          "label": "本战役是否尚未通过此奖励获得皇家解剖刀？",
          "type": "boolean"
        }
      ]
    },
    "level-4": {
      "type": "automatic",
      "steps": [
        {
          "op": "repeat",
          "count": {
            "input": "kills"
          },
          "steps": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "奖励骰",
              "rows": [
                {
                  "min": 1,
                  "max": 6,
                  "steps": []
                },
                {
                  "min": 7,
                  "max": 9,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    }
                  ]
                },
                {
                  "min": 10,
                  "max": 10,
                  "steps": [
                    {
                      "op": "draw",
                      "deck": "basic",
                      "count": 1
                    },
                    {
                      "op": "if",
                      "key": "scalpelAvailable",
                      "yes": [
                        {
                          "op": "take",
                          "name": "Royal Scalpel",
                          "count": 1,
                          "once": true
                        }
                      ],
                      "no": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "op": "take",
          "name": "Bone Charm",
          "count": 1
        },
        {
          "op": "note",
          "text": "其他幸存者奖励和后续狩猎选择见原图。"
        }
      ],
      "inputs": [
        {
          "key": "kills",
          "label": "本次实际击败的食骨者数量",
          "type": "number",
          "min": 0,
          "max": 5
        },
        {
          "key": "scalpelAvailable",
          "label": "本战役是否尚未通过此奖励获得皇家解剖刀？",
          "type": "boolean"
        }
      ]
    }
  },
  "butcher": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "屠夫消失，无卡牌奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "资源数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "破损提灯数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                },
                {
                  "op": "note",
                  "text": "获得对应的屠夫故事事件／发明奖励，请查看原图。"
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Forsaker Mask (CE)",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "屠夫消失，无卡牌奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "资源数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "破损提灯数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                },
                {
                  "op": "note",
                  "text": "获得对应的屠夫故事事件／发明奖励，请查看原图。"
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Forsaker Mask (CE)",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "屠夫消失，无卡牌奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "资源数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Butcher Cleaver",
                  "count": 1
                },
                {
                  "op": "roll",
                  "sides": 5,
                  "bonus": 0,
                  "label": "破损提灯数量骰",
                  "rows": [
                    {
                      "min": 1,
                      "max": 1,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 1,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 2,
                      "max": 2,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 2,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 3,
                      "max": 3,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 3,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 4,
                      "max": 4,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 4,
                          "deck": "basic"
                        }
                      ]
                    },
                    {
                      "min": 5,
                      "max": 5,
                      "steps": [
                        {
                          "op": "take",
                          "name": "Broken Lantern",
                          "count": 5,
                          "deck": "basic"
                        }
                      ]
                    }
                  ]
                },
                {
                  "op": "note",
                  "text": "获得对应的屠夫故事事件／发明奖励，请查看原图。"
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Forsaker Mask (CE)",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        },
        {
          "op": "if",
          "key": "maskAvailable",
          "yes": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "等级 3 额外面具骰",
              "rows": [
                {
                  "min": 1,
                  "max": 1,
                  "steps": []
                },
                {
                  "min": 2,
                  "max": 10,
                  "steps": [
                    {
                      "op": "take",
                      "name": "Forsaker Mask (CE)",
                      "count": 1,
                      "once": true
                    },
                    {
                      "op": "note",
                      "text": "指定幸存者获得面具；每战役仅可通过此额外判定获得一次。"
                    }
                  ]
                }
              ]
            }
          ],
          "no": []
        }
      ],
      "inputs": [
        {
          "key": "maskAvailable",
          "label": "本战役是否尚未通过等级 3 的额外判定获得弃者面具？",
          "type": "boolean"
        }
      ]
    }
  },
  "crimson-crocodile": {
    "prologue-crimson-crocodile": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "获得猩红玻璃工坊；每名幸存者 +1 狩猎经验。随后创建营地。"
        }
      ],
      "inputs": []
    },
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 5
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 5
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "take",
          "name": "Irregular Optic Nerve",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 5
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "if",
          "key": "bloodletting",
          "yes": [
            {
              "op": "roll",
              "sides": 10,
              "bonus": 0,
              "label": "奖励骰",
              "rows": [
                {
                  "min": 1,
                  "max": 4,
                  "steps": [],
                  "label": "未获得额外血泪"
                },
                {
                  "min": 5,
                  "max": 10,
                  "steps": [
                    {
                      "op": "take",
                      "name": "Blood Diamond Tear",
                      "count": 1
                    }
                  ],
                  "label": "获得钻石血泪"
                }
              ]
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": [
        {
          "key": "bloodletting",
          "label": "营地是否已发明“放血”？",
          "type": "boolean"
        }
      ]
    }
  },
  "dragon-king": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "take",
          "name": "Pituitary Gland",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Shining Liver",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "death-of-the-dragon-king": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "结算龙王之死结局。此特殊决战没有普通龙王资源奖励。"
        }
      ],
      "inputs": []
    }
  },
  "dung-beetle-knight": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "take",
          "name": "Preserved Caustic Dung",
          "count": 2
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 7
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "take",
          "name": "Preserved Caustic Dung",
          "count": 3
        },
        {
          "op": "take",
          "name": "Scell",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 8
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Preserved Caustic Dung",
          "count": 3
        },
        {
          "op": "take",
          "name": "Scell",
          "count": 1
        },
        {
          "op": "take",
          "name": "Calcified Juggernaut Blade",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "the-old-master": {
      "type": "manual",
      "note": "年老大师的胜利文字在模组图片中被水印遮挡，无法可靠核对奖励。请查实体规则并在下方手动拿牌，不套用普通等级 3 的奖励。"
    }
  },
  "flower-knight": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Vespertine Cello",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "gambler": {
    "level-4": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "归档护梦者营地地点并获得游戏舞台营地地点。无固定资源卡奖励。"
        }
      ],
      "inputs": []
    }
  },
  "godhand": {
    "level-4": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "结算“尾声 · 胜利”故事事件，无固定资源卡奖励。"
        }
      ],
      "inputs": []
    }
  },
  "gold-smoke-knight": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "结算“游戏结束”故事事件，无固定资源卡奖励。"
        }
      ],
      "inputs": []
    }
  },
  "gorm": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Stomach Lining",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "king": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 5
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 7
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 10
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "king-s-man": {
    "level-1": {
      "type": "automatic",
      "inputs": [],
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 2,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Monster Organ",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "note",
                  "text": "每名幸存者获得一个随机战斗技艺。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Steel Sword",
                  "count": 1
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "结算王之诅咒及规则书列出的其他效果。"
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "inputs": [],
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 2,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Monster Organ",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "note",
                  "text": "每名幸存者获得一个随机战斗技艺。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Steel Sword",
                  "count": 1
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "结算王之诅咒及规则书列出的其他效果。"
        }
      ]
    },
    "level-3": {
      "type": "automatic",
      "inputs": [],
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 2,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Monster Organ",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "note",
                  "text": "每名幸存者获得一个随机战斗技艺。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Steel Sword",
                  "count": 1
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "结算王之诅咒及规则书列出的其他效果。"
        }
      ]
    }
  },
  "killenium-butcher": {
    "killenium-butcher-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Killenium Cleaver",
          "count": 1
        },
        {
          "op": "roll",
          "sides": 5,
          "bonus": 0,
          "label": "破损提灯数量骰",
          "rows": [
            {
              "min": 1,
              "max": 1,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 2,
              "max": 2,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 2,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 3,
              "max": 3,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 3,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 4,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 4,
                  "deck": "basic"
                }
              ]
            },
            {
              "min": 5,
              "max": 5,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 5,
                  "deck": "basic"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "每名幸存者 +2 勇气；经验、砍肉刀熟练度按原图结算。"
        }
      ],
      "inputs": []
    },
    "killenium-butcher-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Killenium Cleaver",
          "count": 1
        },
        {
          "op": "take",
          "name": "Forsaker Mask (CE)",
          "count": 1
        },
        {
          "op": "take",
          "name": "Broken Lantern",
          "count": 5,
          "deck": "basic"
        },
        {
          "op": "take",
          "name": "Cold Living Flesh",
          "count": 1
        },
        {
          "op": "note",
          "text": "每名幸存者 +2 勇气；经验、砍肉刀熟练度按原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "lion-knight": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Lion Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "结算“中场休息”故事事件。"
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败狮骑士？",
          "type": "boolean"
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Lion Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "结算“中场休息”故事事件。"
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败狮骑士？",
          "type": "boolean"
        }
      ]
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "first",
          "yes": [
            {
              "op": "take",
              "name": "Lion Knight Badge",
              "count": 1
            }
          ],
          "no": []
        },
        {
          "op": "note",
          "text": "结算“大结局”故事事件。"
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": [
        {
          "key": "first",
          "label": "是否第一次击败狮骑士？",
          "type": "boolean"
        }
      ]
    }
  },
  "lion-god": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 8
        },
        {
          "op": "draw",
          "deck": "lion-god-archive--lion-god-strange-resources",
          "count": 1
        },
        {
          "op": "take",
          "name": "Necromancer's Eye",
          "count": 1
        },
        {
          "op": "note",
          "text": "若未发明死灵法，结算“狮之神”事件；其他传承效果见原图。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 10
        },
        {
          "op": "draw",
          "deck": "lion-god-archive--lion-god-strange-resources",
          "count": 2
        },
        {
          "op": "take",
          "name": "Golden Plate",
          "count": 1
        },
        {
          "op": "note",
          "text": "若未发明死灵法，结算“狮之神”事件；其他传承效果见原图。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 12
        },
        {
          "op": "draw",
          "deck": "lion-god-archive--lion-god-strange-resources",
          "count": 3
        },
        {
          "op": "take",
          "name": "Lion God Statue",
          "count": 1
        },
        {
          "op": "note",
          "text": "若未发明死灵法，结算“狮之神”事件；其他传承效果见原图。"
        }
      ],
      "inputs": []
    }
  },
  "lonely-tree": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Jagged Marrow Fruit",
          "count": 1
        },
        {
          "op": "note",
          "text": "可额外获得板上每张草药的资源，按现场草药数量手动拿牌；果实与树相关效果见原图。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Blistering Plasma Fruit",
          "count": 1
        },
        {
          "op": "note",
          "text": "可额外获得板上每张草药的资源，按现场草药数量手动拿牌；果实与树相关效果见原图。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Drifting Dream Fruit",
          "count": 1
        },
        {
          "op": "note",
          "text": "可额外获得板上每张草药的资源，按现场草药数量手动拿牌；果实与树相关效果见原图。"
        }
      ],
      "inputs": []
    }
  },
  "manhunter": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Revebrating Lantern",
          "count": 1
        },
        {
          "op": "roll",
          "sides": 10,
          "bonus": 0,
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 1,
              "steps": []
            },
            {
              "min": 2,
              "max": 10,
              "steps": [
                {
                  "op": "note",
                  "text": "造成致命一击的幸存者获得坚韧战斗技艺。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Manhunter's Hat",
          "count": 1
        },
        {
          "op": "roll",
          "sides": 10,
          "bonus": 0,
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 1,
              "steps": []
            },
            {
              "min": 2,
              "max": 10,
              "steps": [
                {
                  "op": "note",
                  "text": "造成致命一击的幸存者获得深谋远虑战斗技艺。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "结算故事事件“战争的工具”，按事件中的实际选择获得奖励；可在下方指定拿牌。"
        }
      ],
      "inputs": []
    },
    "level-4": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Deathpact",
          "count": 1
        },
        {
          "op": "note",
          "text": "每名幸存者获得一个自选战斗技艺；其他传承效果见原图。"
        }
      ],
      "inputs": []
    }
  },
  "phoenix": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 5
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 7
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 9
        },
        {
          "op": "take",
          "name": "Phoenix Crest",
          "count": 1
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "golden-eyed-king-of-1000-years": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 9
        },
        {
          "op": "take",
          "name": "Phoenix Crest",
          "count": 1
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        },
        {
          "op": "note",
          "text": "致命一击者获得 +1,000 狂意及千战之王秘密战斗技艺。"
        }
      ],
      "inputs": []
    }
  },
  "screaming-antelope": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 7
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "draw",
          "deck": "kingdom-death-monster-archive--core-vermin",
          "count": 2
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "mad-steed": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "draw",
          "deck": "kingdom-death-monster-archive--core-vermin",
          "count": 2
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        },
        {
          "op": "chosen",
          "key": "resource"
        },
        {
          "op": "note",
          "text": "致命一击者获得断臂严重伤、赤拳秘密战斗技艺、+9 勇气、开拓之剑；详见原图。"
        }
      ],
      "inputs": [
        {
          "key": "resource",
          "type": "card",
          "label": "选择额外的 1 张尖叫羚羊资源",
          "deck": "monster"
        }
      ]
    }
  },
  "slenderman": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "没有资源奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 2
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Black Lichen",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "若营地尚无黑水研究，获得该发明。其他传承效果见规则原图。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "没有资源奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 2
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Black Lichen",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "若营地尚无黑水研究，获得该发明。其他传承效果见规则原图。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": "level",
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 3,
              "steps": [],
              "label": "没有资源奖励。"
            },
            {
              "min": 4,
              "max": 6,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                }
              ]
            },
            {
              "min": 7,
              "max": 9,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 10,
              "max": 12,
              "steps": [
                {
                  "op": "take",
                  "name": "Dark Water",
                  "count": 2
                },
                {
                  "op": "take",
                  "name": "Iron",
                  "count": 1
                }
              ]
            },
            {
              "min": 13,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Black Lichen",
                  "count": 1
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "若营地尚无黑水研究，获得该发明。其他传承效果见规则原图。"
        }
      ],
      "inputs": []
    }
  },
  "smog-singers": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "peace",
          "yes": [
            {
              "op": "note",
              "text": "和睦：不获得资源奖励，获得和平曲发明（已有则无事发生）；照常获得经验和武器熟练度。"
            }
          ],
          "no": [
            {
              "op": "draw",
              "deck": "basic",
              "count": 4
            },
            {
              "op": "draw",
              "deck": "monster",
              "count": 4
            },
            {
              "op": "note",
              "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
            }
          ]
        }
      ],
      "inputs": [
        {
          "key": "peace",
          "label": "本次是否以“和睦”结束？",
          "type": "boolean"
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "peace",
          "yes": [
            {
              "op": "note",
              "text": "和睦：不获得资源奖励，获得和平曲发明（已有则无事发生）；照常获得经验和武器熟练度。"
            }
          ],
          "no": [
            {
              "op": "draw",
              "deck": "basic",
              "count": 5
            },
            {
              "op": "draw",
              "deck": "monster",
              "count": 6
            },
            {
              "op": "note",
              "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
            }
          ]
        }
      ],
      "inputs": [
        {
          "key": "peace",
          "label": "本次是否以“和睦”结束？",
          "type": "boolean"
        }
      ]
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "if",
          "key": "peace",
          "yes": [
            {
              "op": "note",
              "text": "和睦：不获得资源奖励，获得和平曲发明（已有则无事发生）；照常获得经验和武器熟练度。"
            }
          ],
          "no": [
            {
              "op": "draw",
              "deck": "basic",
              "count": 6
            },
            {
              "op": "draw",
              "deck": "monster",
              "count": 8
            },
            {
              "op": "take",
              "name": "Black Lichen",
              "count": 1
            },
            {
              "op": "note",
              "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
            }
          ]
        }
      ],
      "inputs": [
        {
          "key": "peace",
          "label": "本次是否以“和睦”结束？",
          "type": "boolean"
        }
      ]
    }
  },
  "spidicules": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Silken Nervous System",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "sunstalker": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "take",
          "name": "Sunstones",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "take",
          "name": "1,000 Year Old Sunspot",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 7
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "3,000 Year Old Sunspot",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "the-great-devourer": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "结算大吞噬者的结局与游戏结束，没有普通逐日者资源奖励。"
        }
      ],
      "inputs": []
    }
  },
  "the-hand": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": 0,
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "向营地库存加入 1 个废料；指定幸存者受到爆炸的严重伤。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Crucible",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 5
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": 0,
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "向营地库存加入 1 个废料；指定幸存者受到爆炸的严重伤。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Crucible",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 5
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "roll",
          "sides": 10,
          "bonus": 0,
          "label": "奖励骰",
          "rows": [
            {
              "min": 1,
              "max": 4,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            },
            {
              "min": 5,
              "max": 8,
              "steps": [
                {
                  "op": "take",
                  "name": "Broken Lantern",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "note",
                  "text": "向营地库存加入 1 个废料；指定幸存者受到爆炸的严重伤。"
                }
              ]
            },
            {
              "min": 9,
              "max": null,
              "steps": [
                {
                  "op": "take",
                  "name": "Perfect Crucible",
                  "count": 1
                },
                {
                  "op": "take",
                  "name": "Skull",
                  "count": 1,
                  "deck": "basic"
                },
                {
                  "op": "draw",
                  "deck": "basic",
                  "count": 5
                },
                {
                  "op": "note",
                  "text": "营地 -1 人口。"
                }
              ]
            }
          ]
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "the-tyrant": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Dragon Vestments",
          "count": {
            "input": "chosen"
          }
        },
        {
          "op": "note",
          "text": "获得装备者获得对应的失调；其他选择见原图。"
        }
      ],
      "inputs": [
        {
          "key": "chosen",
          "label": "选择获得龙纹法衣的幸存者数量",
          "type": "number",
          "min": 0,
          "max": 2
        }
      ]
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "take",
          "name": "Celestial Spear",
          "count": 1
        },
        {
          "op": "note",
          "text": "每名获胜幸存者获得 1 个随机战斗技艺。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "每名获胜幸存者获得 +1 勇气、+1 认知。其他发明选择见原图。"
        }
      ],
      "inputs": []
    }
  },
  "watcher": {
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "note",
          "text": "所有活着的幸存者获得永久 +1 力量，然后结算“灯火熄灭”。无固定资源卡奖励。"
        }
      ],
      "inputs": []
    }
  },
  "white-lion-whitebox": {
    "young-lion": {
      "type": "manual",
      "note": "模组未提供 Young Lion 的专用胜利规则页。请按实体规则手动拿牌，不套用普通白狮等级 1 的奖励。"
    }
  },
  "white-gigalion": {
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 5
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 7
        },
        {
          "op": "take",
          "name": "Hooked Claw",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 6
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 9
        },
        {
          "op": "take",
          "name": "Hooked Claw",
          "count": 2
        },
        {
          "op": "take",
          "name": "Elder Cat Teeth",
          "count": 1
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    }
  },
  "white-lion": {
    "prologue": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "每名幸存者记录第一次狩猎经验。随后创建营地。"
        }
      ],
      "inputs": []
    },
    "level-1": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 4
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-2": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 6
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "level-3": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Elder Cat Teeth",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        }
      ],
      "inputs": []
    },
    "beast-of-sorrow": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Elder Cat Teeth",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        },
        {
          "op": "take",
          "name": "Iron",
          "count": 1
        },
        {
          "op": "note",
          "text": "致命一击者获得一个随机战斗技艺。"
        }
      ],
      "inputs": []
    },
    "great-golden-cat": {
      "type": "automatic",
      "steps": [
        {
          "op": "draw",
          "deck": "basic",
          "count": 4
        },
        {
          "op": "draw",
          "deck": "monster",
          "count": 8
        },
        {
          "op": "take",
          "name": "Elder Cat Teeth",
          "count": 1
        },
        {
          "op": "note",
          "text": "首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。"
        },
        {
          "op": "take",
          "name": "Iron",
          "count": 1
        },
        {
          "op": "take",
          "name": "Black Lichen",
          "count": 1
        },
        {
          "op": "note",
          "text": "致命一击者永久 +2 力量，获得永恒之眼与连击大师战斗技艺。"
        }
      ],
      "inputs": []
    }
  }
};
