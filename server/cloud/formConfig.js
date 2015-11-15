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
            "eastBay": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "peninsula": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "northBay": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "sanFrancisco": {"meta": {"kind": "irreducible", "name": "Bool"}},
            "southBay": {"meta": {"kind": "irreducible", "name": "Bool"}}
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
      "expcetedSalary": {"meta": {"kind": "irreducible", "name": "Str", "options": {"config": {"addonBefore": "$", "addonAfter": "/year"}, "attrs": {"className": "form-input-small"}}}},
      "workAuthorization": {
        "meta": {
          "options": {"attrs": {"className": "form-input-small"}},
          "kind": "enums",
          "props": {
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
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
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
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
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
}
];  

module.exports = {
  formDefinition: formDef
}