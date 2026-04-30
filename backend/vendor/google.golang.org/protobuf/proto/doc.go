// Copyright 2019 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Package proto provides functions operating on protocol buffer messages.
//
// For documentation on protocol buffers in general, see:
// https://protobuf.dev.
//
// For a tutorial on using protocol buffers with Go, see:
// https://protobuf.dev/getting-started/gotutorial.
//
// For a guide to generated Go protocol buffer code, see:
// https://protobuf.dev/reference/go/go-generated.
//
// # Binary serialization
//
// This package contains functions to convert to and from the wire format,
// an efficient binary serialization of protocol buffers.
//
//
//     The [MarshalOptions] type provides more control over wire marshaling.
//
//     The [UnmarshalOptions] type provides more control over wire unmarshaling.
//
// # Basic message operations
//
//
//
//     and detailed reporting of differences, see package
//     [google.golang.org/protobuf/testing/protocmp].
//
//
//
// # Optional scalar constructors
//
// The API for some generated messages represents optional scalar fields
// as pointers to a value. For example, an optional string field has the
// Go type *string.
//
//     take a value and return a pointer to a new instance of it,
//     to simplify construction of optional field values.
//
// Generated enum types usually have an Enum method which performs the
// same operation.
//
// Optional scalar fields are only supported in proto2.
//
// # Extension accessors
//
//     access extension field values in a protocol buffer message.
//
// Extension fields are only supported in proto2.
//
// # Related packages
//
//     and from JSON.
//
//     and from the text format.
//
//     reflection interface for protocol buffer data types.
//
//     to compare protocol buffer messages with the [github.com/google/go-cmp/cmp]
//     package.
//
//     message type, suitable for working with messages where the protocol buffer
//     type is only known at runtime.
//
// This module contains additional packages for more specialized use cases.
// Consult the individual package documentation for details.
package proto
