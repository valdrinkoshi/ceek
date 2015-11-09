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
      "expcetedSalary": {"meta": {"kind": "irreducible", "name": "Str"}},
      "workAuthorization": {
        "meta": {
          "kind": "enums",
          "props": {
            "L1": "L1",
            "H1B": "H1B",
            "GC": "Green Card",
            "CTZ": "Citizen"
          }
        }
      },
      "dontContact": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "dontContact", "attrs": {"className": "myClassName"}}}}}},
    }
  }
},
{
  "stepTitle": "Personal Info",
  "meta": {
    "kind": "struct",
    "props": {
      "phoneNumber": {"meta": {"kind": "irreducible", "name": "Str"}},
      "currentLocation": {"meta": {"kind": "irreducible", "name": "Str"}},
      "github": {"meta": {"kind": "irreducible", "name": "Str"}},
      "summary": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea", "label":"summary"}}},
      "skills": {
        "meta": {
          "kind": "maybe",
          "type": {
            "meta": {
              "options": {"disableOrder": true},
              "kind": "list",
              "type": {
                "meta": {
                  "kind": "irreducible", "name": "Str", "options": {"attrs": {"className": "mycls"}}
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
              "type": {
                "meta": {
                  "kind": "struct",
                  "props": {
                    "companyName": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "experience.companyName"}}},
                    "role": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "experience.role"}}},
                    "description": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea"}}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
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
              "type": {
                "meta": {
                  "kind": "struct",
                  "props": {
                    "collegeName": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "education.collegeName"}}},
                    "degree": {"meta": {"kind": "irreducible", "name": "Str", "options": {"label": "education.degree"}}},
                    "description": {"meta": {"kind": "irreducible", "name": "Str", "options":{"type":"textarea"}}},
                    "endDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
                    "startDate": {"meta": {"kind": "maybe", "type": {"meta": {"kind": "irreducible", "name": "Dat"}}}},
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