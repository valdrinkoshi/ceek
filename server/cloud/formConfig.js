var formDef = [
{
  "stepTitle": "Job Preferences",
  "meta": {
    "kind": "struct",
    "props": {
      "locationPreference": {
        "meta": {
          "options": {"template": ["getMultiColumnsLayout", 4], "label": "locationPreference"},
          "kind": "struct",
          "props": {
            "eastBay": {"meta": {"kind": "irreducible", "name": "Bool", "options": {"label": "locationPreference.eastBay"}}},
            "peninsula": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "northBay": {"meta": {"kind": "irreducible", "name": "Bool", "options": {"label": "locationPreference.northBay"}}},
            "sanFrancisco": {"meta": {"kind": "irreducible", "name": "Bool", "options": {"label": "locationPreference.sanFrancisco"}}},
            "southBay": {"meta": {"kind": "irreducible", "name": "Bool", "options": {"label": "locationPreference.southBay"}}}
          }
        }
      },
      "roleType": {
        "meta": {
          "options": {"template": ["getMultiColumnsLayout", 4], "label": "roleType"},
          "kind": "struct",
          "props": {
            "frontendDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "backendDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "mobileDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "architect": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "test": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "fullstackDeveloper": {"meta": {"kind": "irreducible", "name": "Bool"}}
          }
        }
      },
      "employmentType": {
        "meta": {
          "options": {"template": ["getMultiColumnsLayout", 4], "label": "employmentType"},
          "kind": "struct",
          "props": {
            "contract": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "intern": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "partTime": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "fullTime": {"meta": {"kind": "irreducible", "name": "Bool", "options": {"label": "employmentType.permanent"}}}
          }
        }
      },
      "expectedSalary": {"meta": {"kind": "irreducible", "name": "Num", "options": {"template": ["forceCustomClass", "form-input-small"], "config": {"addonBefore": "$", "addonAfter": "/year"}}}},
      "workAuthorization": {
        "meta": {
          "options": {"attrs": {"className": "form-input-small"}},
          "kind": "enums",
          "props": {
            "F1": "F1",
            "L1": "L1",
            "H1B": "H1B",
            "GC": "Green Card",
            "CTZ": "Citizen"
          }
        }
      },
      "dontContact": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "dontContact", "attrs": {"className": "form-input-small"}}}}}},
    }
  }
},
{
  "stepTitle": "Personal Info",
  "meta": {
    "kind": "struct",
    "props": {
      "phoneNumber": {"meta": {"kind": "irreducible", "name": "Num", "options": {"attrs": {"className": "form-input-small"}},}},
      "currentLocation": {"meta": {"kind": "irreducible", "name": "Str", "options": {"attrs": {"className": "form-input-small"}},}},
      "github": {"meta": {"kind": "irreducible", "name": "Str", "options": {"attrs": {"className": "form-input-small"}},}},
      "summary": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea", "label":"summary", "attrs": {"className": "form-textarea-small"}}}},
      "skills": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "options": {"disableOrder": true, "template": ["getMultiColumnsLayout", 4]},
              "kind": "list",
              "type": {
                "meta": {
                  "kind": "irreducible", "name": "Str"
                }
              }
            }
          }
        }
      },
      "experience": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "kind": "list",
              "options": {"disableOrder": true, "template": ["getListLayout"]},
              "type": {
                "meta": {
                  "options": {"template": ["getExperienceLayout"]},
                  "kind": "struct",
                  "props": {
                    "companyName": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "experience.companyName"}}},
                    "role": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "experience.role"}}},
                    "description": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea"}}}}},
                    "startDate": {
                      "meta": {
                        "kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "CeekDate", "options": {"transformer": ["dateTransformer"], "factory": "t.form.Datetime"}}}}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "CeekDate", "options": {"transformer": ["dateTransformer"], "factory": "t.form.Datetime"}}}}},
                    "current": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Bool"}}}},
                  }
                }
              }
            }
          }
        }
      },
      "education": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "kind": "list",
              "options": {"disableOrder": true, "template": ["getListLayout"]},
              "type": {
                "meta": {
                  "kind": "struct",
                  "options": {"template": ["getEducationLayout"]},
                  "props": {
                    "collegeName": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "education.collegeName"}}},
                    "degree": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "education.degree"}}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible",  "name": "CeekDate", "options": {"transformer": ["dateTransformer"], "factory": "t.form.Datetime"}}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible",  "name": "CeekDate", "options": {"transformer": ["dateTransformer"], "factory": "t.form.Datetime"}}}}},
                    "current": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Bool"}}}}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
},
{
  "stepTitle": "Sample Project",
  "meta": {
    "kind": "struct",
    "props": {
      "projectLink": {"meta": {"kind": "irreducible", "name": "Str", "options": {"attrs": {"className": "form-input-small"}}}},
      "projectDescription": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea", "label":"portfolio.description", "attrs": {"className": "form-textarea-small"}}}},
      "projectWhy": {
        "meta": {
          "options": {"attrs": {"className": "form-input-small"}, "label": "portfolio.why"},
          "kind": "enums",
          "props": {
            "1": "For fun",
            "2": "For my work",
            "3": "To earn some side income",
            "4": "To try out new technologies",
            "5": "To learn something new",
            "6": "To solve a problem I have",
            "7": "To test my startup ideas",
            "8": "To have some projects in my portfolio",
            "9": "Just for sake of doing something"
          }
        }
      },
      "howMany": {"meta": {"kind": "irreducible", "name": "Num", "options": {"attrs": {"className": "form-input-small"},"label": "portfolio.howMany"}}
      },
      "contribution": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "kind": "list",
              "options": {"disableOrder": true, "label": "contribution", "template": ["getListLayout"]},
              "type": {
                "meta": {
                  "kind": "struct",
                  "options": {"template": ["getMultiColumnsLayout", 2]},
                  "props": {
                    "process": {
                      "meta": {
                      "kind": "enums",
                      "props": {
                        "1": "Ideation",
                        "2": "Design",
                        "3": "Develop",
                        "4": "Testing",
                        "5": "Release",
                        "6": "Maintenance",
                        "7": "Marketing"
                      }
                  }
                },
                    "percentage": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "contribution.percentage"}}},
                  }
                }
              }
            }
          }
        }
      }
    },
  }
},
{
  "stepTitle": "Test Your Work Style",
  "meta": {
    "kind": "struct",
    "options": {"template": ["getCarouselLayout"]},
    "props": {
      "questionnaire_question1": {
        "meta": {
          "options": {"label": "questionnaire.question1", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Insightful & big picture oriented",
            "2": "Detail oriented & craft man like",
            "3": "Conceptual & intuitive",
            "4": "Analytical & rigorous"
          }
        }
      },
      "questionnaire_question2": {
        "meta": {
          "options": {"label": "questionnaire.question2", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Probing",
            "2": "Constructing",
            "3": "Planning",
            "4": "Innovating"
          }
        }
      },
      "questionnaire_question3": {
        "meta": {
          "options": {"label": "questionnaire.question3", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Efficient",
            "2": "Intuitive",
            "3": "Skillful",
            "4": "Thorough"
          }
        }
      },
      "questionnaire_question4": {
        "meta": {
          "options": {"label": "questionnaire.question4", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Skill",
            "2": "Research",
            "3": "Ability to structure",
            "4": "Experimentation"
          }
        }
      },
      "questionnaire_question5": {
        "meta": {
          "options": {"label": "questionnaire.question5", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Provide written proof",
            "2": "Use props",
            "3": "Use imagination",
            "4": "Use charts and graphs"
          }
        }
      },
      "questionnaire_question6": {
        "meta": {
          "options": {"label": "questionnaire.question6", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Spontaneous",
            "2": "Methodical",
            "3": "Technical",
            "4": "Thorough"
          }
        }
      },
      "questionnaire_question7": {
        "meta": {
          "options": {"label": "questionnaire.question7", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Do the work myself",
            "2": "Brainstorming with others",
            "3": "Be able to delegate",
            "4": "Have the work flow to me smoothly"
          }
        }
      },
      "questionnaire_question8": {
        "meta": {
          "options": {"label": "questionnaire.question8", "factory": "t.form.Radio"},
          "kind": "enums",
          "props": {
            "1": "Craftmanship",
            "2": "Neatness",
            "3": "Originality",
            "4": "Being the most realistic"
          }
        }
      },
    }
  }
}
];

module.exports = {
  formDefinition: formDef
}
