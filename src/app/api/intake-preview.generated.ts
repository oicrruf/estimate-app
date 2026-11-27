// Generated from the public PR #37 OpenAPI artifact. Do not edit by hand.
// This preview client is separate from the approved canonical health contract.
const schemas: Record<string, Schema> = {
  "AssetAvailability": {
    "enum": [
      "available",
      "unavailable",
      "unknown"
    ],
    "title": "AssetAvailability",
    "type": "string"
  },
  "AssetValidation": {
    "enum": [
      "validated",
      "unvalidated",
      "unknown"
    ],
    "title": "AssetValidation",
    "type": "string"
  },
  "BlockingQuestionPayload": {
    "additionalProperties": false,
    "properties": {
      "field": {
        "title": "Field",
        "type": "string"
      },
      "text": {
        "title": "Text",
        "type": "string"
      }
    },
    "required": [
      "field",
      "text"
    ],
    "title": "BlockingQuestionPayload",
    "type": "object"
  },
  "Certainty": {
    "enum": [
      "confirmed",
      "inferred"
    ],
    "title": "Certainty",
    "type": "string"
  },
  "ClientAssetPayload": {
    "additionalProperties": false,
    "properties": {
      "availability": {
        "$ref": "#/components/schemas/AssetAvailability"
      },
      "evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Evidence"
      },
      "name": {
        "title": "Name",
        "type": "string"
      },
      "validation": {
        "$ref": "#/components/schemas/AssetValidation"
      }
    },
    "required": [
      "name",
      "availability",
      "validation"
    ],
    "title": "ClientAssetPayload",
    "type": "object"
  },
  "FactPayload_list_MeasurementPayload__": {
    "additionalProperties": false,
    "properties": {
      "certainty": {
        "$ref": "#/components/schemas/Certainty"
      },
      "evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Evidence"
      },
      "value": {
        "items": {
          "$ref": "#/components/schemas/MeasurementPayload"
        },
        "title": "Value",
        "type": "array"
      }
    },
    "required": [
      "value",
      "certainty"
    ],
    "title": "FactPayload[list[MeasurementPayload]]",
    "type": "object"
  },
  "FactPayload_list_str__": {
    "additionalProperties": false,
    "properties": {
      "certainty": {
        "$ref": "#/components/schemas/Certainty"
      },
      "evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Evidence"
      },
      "value": {
        "items": {
          "type": "string"
        },
        "title": "Value",
        "type": "array"
      }
    },
    "required": [
      "value",
      "certainty"
    ],
    "title": "FactPayload[list[str]]",
    "type": "object"
  },
  "FactPayload_str_": {
    "additionalProperties": false,
    "properties": {
      "certainty": {
        "$ref": "#/components/schemas/Certainty"
      },
      "evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Evidence"
      },
      "value": {
        "title": "Value",
        "type": "string"
      }
    },
    "required": [
      "value",
      "certainty"
    ],
    "title": "FactPayload[str]",
    "type": "object"
  },
  "HTTPValidationError": {
    "properties": {
      "detail": {
        "items": {
          "$ref": "#/components/schemas/ValidationError"
        },
        "title": "Detail",
        "type": "array"
      }
    },
    "title": "HTTPValidationError",
    "type": "object"
  },
  "HealthResponse": {
    "properties": {
      "status": {
        "const": "ok",
        "default": "ok",
        "title": "Status",
        "type": "string"
      }
    },
    "title": "HealthResponse",
    "type": "object"
  },
  "IntakePayload": {
    "additionalProperties": false,
    "properties": {
      "client_assets": {
        "items": {
          "$ref": "#/components/schemas/ClientAssetPayload"
        },
        "title": "Client Assets",
        "type": "array"
      },
      "client_assets_absence_evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Client Assets Absence Evidence"
      },
      "description": {
        "maxLength": 4000,
        "minLength": 1,
        "title": "Description",
        "type": "string"
      },
      "environment": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "exclusions": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_str__"
          },
          {
            "type": "null"
          }
        ]
      },
      "location": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "measurements": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_MeasurementPayload__"
          },
          {
            "type": "null"
          }
        ]
      },
      "objective": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "restrictions": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_str__"
          },
          {
            "type": "null"
          }
        ]
      },
      "sketch": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "supplies": {
        "items": {
          "$ref": "#/components/schemas/SupplyItemPayload"
        },
        "title": "Supplies",
        "type": "array"
      },
      "supplies_absence_evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Supplies Absence Evidence"
      }
    },
    "required": [
      "description"
    ],
    "title": "IntakePayload",
    "type": "object"
  },
  "IntakePreviewRequest": {
    "additionalProperties": false,
    "properties": {
      "intake": {
        "$ref": "#/components/schemas/IntakePayload"
      },
      "operation": {
        "const": "create_project",
        "title": "Operation",
        "type": "string"
      }
    },
    "required": [
      "operation",
      "intake"
    ],
    "title": "IntakePreviewRequest",
    "type": "object"
  },
  "IntakePreviewResponse": {
    "additionalProperties": false,
    "properties": {
      "draft": {
        "$ref": "#/components/schemas/ScopeDraftPayload"
      },
      "persisted": {
        "const": false,
        "default": false,
        "title": "Persisted",
        "type": "boolean"
      },
      "project_id": {
        "title": "Project Id",
        "type": "null"
      },
      "proposed_purchase_items": {
        "items": {
          "type": "string"
        },
        "title": "Proposed Purchase Items",
        "type": "array"
      },
      "review_required": {
        "const": true,
        "default": true,
        "title": "Review Required",
        "type": "boolean"
      },
      "stage": {
        "const": "scope_review_pending",
        "default": "scope_review_pending",
        "title": "Stage",
        "type": "string"
      }
    },
    "required": [
      "draft",
      "proposed_purchase_items"
    ],
    "title": "IntakePreviewResponse",
    "type": "object"
  },
  "MeasurementPayload": {
    "additionalProperties": false,
    "properties": {
      "label": {
        "title": "Label",
        "type": "string"
      },
      "unit": {
        "title": "Unit",
        "type": "string"
      },
      "value": {
        "title": "Value",
        "type": "number"
      }
    },
    "required": [
      "label",
      "value",
      "unit"
    ],
    "title": "MeasurementPayload",
    "type": "object"
  },
  "ScopeDraftPayload": {
    "additionalProperties": false,
    "properties": {
      "blocking_questions": {
        "items": {
          "$ref": "#/components/schemas/BlockingQuestionPayload"
        },
        "title": "Blocking Questions",
        "type": "array"
      },
      "client_assets": {
        "items": {
          "$ref": "#/components/schemas/ClientAssetPayload"
        },
        "title": "Client Assets",
        "type": "array"
      },
      "client_assets_absence_evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Client Assets Absence Evidence"
      },
      "contract_version": {
        "title": "Contract Version",
        "type": "string"
      },
      "description": {
        "maxLength": 4000,
        "minLength": 1,
        "title": "Description",
        "type": "string"
      },
      "environment": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "exclusions": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_str__"
          },
          {
            "type": "null"
          }
        ]
      },
      "location": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "measurements": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_MeasurementPayload__"
          },
          {
            "type": "null"
          }
        ]
      },
      "objective": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "restrictions": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_list_str__"
          },
          {
            "type": "null"
          }
        ]
      },
      "sketch": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/FactPayload_str_"
          },
          {
            "type": "null"
          }
        ]
      },
      "supplies": {
        "items": {
          "$ref": "#/components/schemas/SupplyItemPayload"
        },
        "title": "Supplies",
        "type": "array"
      },
      "supplies_absence_evidence": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "title": "Supplies Absence Evidence"
      }
    },
    "required": [
      "description",
      "contract_version",
      "blocking_questions"
    ],
    "title": "ScopeDraftPayload",
    "type": "object"
  },
  "SupplyItemPayload": {
    "additionalProperties": false,
    "properties": {
      "name": {
        "title": "Name",
        "type": "string"
      },
      "purchase_required": {
        "default": false,
        "title": "Purchase Required",
        "type": "boolean"
      },
      "supplied_by": {
        "$ref": "#/components/schemas/SupplyOwner"
      }
    },
    "required": [
      "name",
      "supplied_by"
    ],
    "title": "SupplyItemPayload",
    "type": "object"
  },
  "SupplyOwner": {
    "enum": [
      "client",
      "contractor"
    ],
    "title": "SupplyOwner",
    "type": "string"
  },
  "ValidationError": {
    "properties": {
      "loc": {
        "items": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "integer"
            }
          ]
        },
        "title": "Location",
        "type": "array"
      },
      "msg": {
        "title": "Message",
        "type": "string"
      },
      "type": {
        "title": "Error Type",
        "type": "string"
      }
    },
    "required": [
      "loc",
      "msg",
      "type"
    ],
    "title": "ValidationError",
    "type": "object"
  }
};

type Schema = { [key: string]: unknown; $ref?: string; anyOf?: Schema[]; type?: string; enum?: unknown[]; const?: unknown; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: boolean; items?: Schema; minLength?: number; maxLength?: number };
export type Certainty = 'confirmed' | 'inferred';
export type Fact<T> = { value: T; certainty: Certainty; evidence?: string | null };
export type Measurement = { label: string; value: number; unit: string };
export type ClientAsset = { name: string; availability: 'available' | 'unavailable' | 'unknown'; validation: 'validated' | 'unvalidated' | 'unknown'; evidence?: string | null };
export type SupplyItem = { name: string; supplied_by: 'client' | 'contractor'; purchase_required?: boolean };
export type Intake = { description: string; objective?: Fact<string> | null; location?: Fact<string> | null; environment?: Fact<string> | null; sketch?: Fact<string> | null; measurements?: Fact<Measurement[]> | null; restrictions?: Fact<string[]> | null; exclusions?: Fact<string[]> | null; client_assets?: ClientAsset[]; client_assets_absence_evidence?: string | null; supplies?: SupplyItem[]; supplies_absence_evidence?: string | null };
export type IntakePreviewRequest = { operation: 'create_project'; intake: Intake };
export type BlockingQuestion = { field: string; text: string };
export type ScopeDraft = Intake & { contract_version: string; blocking_questions: BlockingQuestion[] };
export type IntakePreviewResponse = { draft: ScopeDraft; proposed_purchase_items: string[]; stage?: 'scope_review_pending'; review_required?: true; persisted?: false; project_id?: null };

function valid(schema: Schema, value: unknown): boolean {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    return schema.$ref === '#/components/schemas/' + name && schemas[name] !== undefined && valid(schemas[name], value);
  }
  if (schema.anyOf) return schema.anyOf.some((branch) => valid(branch, value));
  if (schema.const !== undefined && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === 'null') return value === null;
  if (schema.type === 'string') {
    if (typeof value !== 'string') return false;
    const length = [...value].length;
    return (schema.minLength === undefined || length >= schema.minLength) && (schema.maxLength === undefined || length <= schema.maxLength);
  }
  if (schema.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (schema.type === 'boolean') return typeof value === 'boolean';
  if (schema.type === 'array') return Array.isArray(value) && (schema.items === undefined || value.every((item) => valid(schema.items!, item)));
  if (schema.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const obj = value as Record<string, unknown>;
    if (schema.required?.some((key) => !(key in obj))) return false;
    if (schema.additionalProperties === false && Object.keys(obj).some((key) => !(key in (schema.properties ?? {})))) return false;
    return Object.entries(obj).every(([key, item]) => !schema.properties?.[key] || valid(schema.properties[key], item));
  }
  return false;
}

function omitOptionalUndefined(schema: Schema, value: unknown): unknown {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    return schemas[name] ? omitOptionalUndefined(schemas[name], value) : value;
  }
  if (schema.anyOf) {
    const branch = schema.anyOf.find((item) => value === null ? item.type === 'null' : item.type !== 'null');
    return branch ? omitOptionalUndefined(branch, value) : value;
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items) return value.map((item) => omitOptionalUndefined(schema.items!, item));
  if (schema.type !== 'object' || value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(input).filter(([key, item]) => item !== undefined || !schema.properties?.[key] || schema.required?.includes(key)).map(([key, item]) => [key, schema.properties?.[key] ? omitOptionalUndefined(schema.properties[key], item) : item]));
}

export function parseIntakePreview(value: unknown): IntakePreviewResponse {
  if (!valid(schemas['IntakePreviewResponse'], value)) throw new Error('Invalid intake preview response');
  const response = value as IntakePreviewResponse;
  if (response.stage !== 'scope_review_pending' || response.review_required !== true || response.persisted !== false || response.project_id !== null) throw new Error('Unsafe intake preview state');
  return response;
}

export async function previewChatIntake(baseUrl: string, intake: Intake, fetcher: typeof fetch = fetch): Promise<IntakePreviewResponse> {
  const request = omitOptionalUndefined(schemas['IntakePreviewRequest'], { operation: 'create_project', intake }) as IntakePreviewRequest;
  if (!valid(schemas['IntakePreviewRequest'], request)) throw new Error('Invalid intake preview request');
  const response = await fetcher(new URL('/v1/chat/intake-preview', baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit', body: JSON.stringify(request) });
  if (!response.ok) throw new Error('Intake preview failed: ' + response.status);
  return parseIntakePreview(await response.json() as unknown);
}
